import postgres from 'postgres'

// const env = process.env.NODE_ENV || 'development';


const connectionString = process.env.DATABASE_URL_IPV4
const sql = postgres(connectionString || "")

export default sql