import mongoose from "mongoose"

/**
 * 🧱 LAYER 3: Advanced Database Security Configurations
 * Applied globally to the Mongoose connection.
 */
export const configureDBSecurity = () => {
  // 1. Prevent $where NoSQL injections globally (if Mongoose supports it)
  // mongoose.set("sanitizeFilter", true) // DISABLED: Breaks internal queries. We rely on mongo-sanitize middleware instead.
  
  // 2. Strict Query Mode: Only allows querying fields defined in the schema
  mongoose.set("strictQuery", true)
  
  // 3. Remove __v and other internal fields from ALL JSON outputs by default across all models
  mongoose.plugin((schema) => {
    schema.set("toJSON", {
      virtuals: true,
      transform: (doc, ret) => {
        delete (ret as any).__v
        // Prevent accidental leaking of common sensitive fields
        delete (ret as any).password
        delete (ret as any).token
        delete (ret as any).secret
        return ret
      }
    })
  })
}
