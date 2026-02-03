import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

type ValidationConfig = {
  body?: z.ZodSchema
  query?: z.ZodSchema
  params?: z.ZodSchema
}

type NextApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void> | void

type ValidationError = {
  type: 'body' | 'query' | 'params'
  errors: z.ZodError
}

/**
 * Validation middleware factory for Next.js API routes
 * @param schema Validation schema configuration
 */
export function validateRequest(schema: ValidationConfig) {
  return (handler: NextApiHandler): NextApiHandler => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        // Validate request body if schema provided
        if (schema.body) {
          try {
            req.body = schema.body.parse(req.body)
          } catch (error) {
            if (error instanceof z.ZodError) {
              return res.status(400).json({
                error: {
                  type: 'body',
                  message: 'Invalid request body',
                  details: error.errors,
                },
              })
            }
            throw error
          }
        }

        // Validate query parameters if schema provided
        if (schema.query) {
          try {
            req.query = schema.query.parse(req.query)
          } catch (error) {
            if (error instanceof z.ZodError) {
              return res.status(400).json({
                error: {
                  type: 'query',
                  message: 'Invalid query parameters',
                  details: error.errors,
                },
              })
            }
            throw error
          }
        }

        // Validate URL parameters if schema provided
        if (schema.params) {
          try {
            const params = schema.params.parse(req.query)
            req.query = { ...req.query, ...params }
          } catch (error) {
            if (error instanceof z.ZodError) {
              return res.status(400).json({
                error: {
                  type: 'params',
                  message: 'Invalid URL parameters',
                  details: error.errors,
                },
              })
            }
            throw error
          }
        }

        // If all validations pass, continue to handler
        return handler(req, res)
      } catch (error) {
        // Handle unexpected errors
        console.error('Validation middleware error:', error)
        return res.status(500).json({
          error: {
            message: 'Internal server error during validation',
          },
        })
      }
    }
  }
}

// Usage example:
const userSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    age: z.number().min(18),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
})

export default validateRequest(userSchema)((req, res) => {
  // Your handler code here
  // Types are now properly inferred from the schema
  const { name, email, age } = req.body
  const { page, limit } = req.query
  const { id } = req.query // params are merged into query

  res.status(200).json({ message: 'Valid request' })
})