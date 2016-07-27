import moment from 'moment';

export default async ({data, reply}) => {
  const {locale, format} = data || {};
  moment.locale(locale || 'en');
  const response = {
    time: moment().format(format)
  };
  await reply(response);
};
