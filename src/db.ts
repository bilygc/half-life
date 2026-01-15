import postgres from 'postgres'

const env = process.env.NODE_ENV || 'development';


const connectionString = env === 'development' ? process.env.DATABASE_URL_IPV4 : process.env.DATABASE_URL_IPV6
const sql = postgres(connectionString || "")

export default sql