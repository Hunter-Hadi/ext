export const objectFilterEmpty = (obj: any, filterEmptyString = true) => {
  const result: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined && obj[key] !== null) {
      if (
        filterEmptyString &&
        typeof obj[key] === 'string' &&
        obj[key].trim() === ''
      ) {
        return;
      }
      result[key] = obj[key];
    }
  });
  return result;
};