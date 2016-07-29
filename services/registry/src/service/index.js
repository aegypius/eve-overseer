import Mongorito, {Model} from 'mongorito';

export const connection = async () => {
  // Connect to mongodb
  const mongoDbName = process.env.MONGODB_NAME || 'registry';
  const mongoHost = process.env.MONGODB_HOST || 'mongo';
  const mongoUrl = `mongodb://${mongoHost}/${mongoDbName}`;
  await Mongorito.connect(mongoUrl);
};

export class Service extends Model {

}
