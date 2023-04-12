export const checkExistence = async (model: any, field: any, value: any) => {
  const where = {}
  where[field] = value
  console.log(where)

  const result = await model.findOne({ where })

  return result ? true : false
}

export const validate = (fields: any, data: any) => {
  const errors = {}
  const dataError = []

  fields.forEach((field: any) => {
    if (!data[field]) {
      dataError.push(
        (errors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`),
      )
    }
  })

  return dataError
}
