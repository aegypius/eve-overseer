import validate from './validate';
import {Service, connection} from '.';

export default async ({data}) => {
  await validate(data);
  await connection();

  const service = new Service(data);
  console.log(data);

  await service.save();
};
