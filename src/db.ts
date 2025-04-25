import type { DatabasePool, Interceptor } from 'slonik';
import { SchemaValidationError, createPool } from 'slonik';

const clientConnectionPools: Record<string, DatabasePool> = {};
const createResultParserInterceptor = (): Interceptor => {
  return {
    // If you are not going to transform results using Zod, then you should use `afterQueryExecution` instead.
    // Future versions of Zod will provide a more efficient parser when parsing without transformations.
    // You can even combine the two – use `afterQueryExecution` to validate results, and (conditionally)
    // transform results as needed in `transformRow`.
    transformRow: (executionContext, actualQuery, row) => {
      const { resultParser } = executionContext;

      if (!resultParser) {
        console.log('Result parser not found');
        return row;
      }

      const validationResult = resultParser.safeParse(row);

      if (!validationResult.success) {
        console.error('Schema validation error', validationResult.error.issues);
        throw new SchemaValidationError(actualQuery, row, validationResult.error.issues);
      }

      return validationResult.success ? validationResult.data : row;
    },
    queryExecutionError(queryContext, query, error, notices) {
      console.error('Query execution error', error.message, error.stack);
      return Promise.reject('DB error');
    },
  };
};
const interceptors = [
  createResultParserInterceptor(),
];

const commonDb = process.env.DB_NAME || 'dashdb';

const getConnection = async (databaseName: string): Promise<any> => {
  if (databaseName in clientConnectionPools) {
    console.log('Connection already exists');
    return clientConnectionPools[databaseName];
  }

  const connectionString: string = process.env.DATABASE_URL || "";

  try {
    const newConnectionPool = await createPool(connectionString, {
      interceptors,
    });
    clientConnectionPools[databaseName] = newConnectionPool;
    return newConnectionPool;
  } catch (error) {
    console.log('Error: ', error);
  }
};

const db = await getConnection(commonDb);

export { getConnection, db };
