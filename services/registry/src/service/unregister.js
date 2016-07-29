import {Service, connection} from '.';

export default async ({data}) => {
  await connection();

  const {name} = data;

  const service = await Service.find({name});
  if (!service) {
    throw new Error(`Service "${name}" not found`);
  }

  service.delete();
};
