module.exports.getDateTime = () => {
  const dateTime = new Date()

  // get current date
  // adjust 0 before single digit date
  const date = ('0' + dateTime.getDate()).slice(-2)

  // get current month
  const month = ('0' + (dateTime.getMonth() + 1)).slice(-2)

  // get current year
  const year = dateTime.getFullYear()

  // get current hours
  const hours = dateTime.getHours()

  // get current minutes
  const minutes = dateTime.getMinutes()

  // get current seconds
  const seconds = dateTime.getSeconds()

  // prints date & time in YYYY-MM-DD HH:MM:SS format
  return (
    year +
    '-' +
    month +
    '-' +
    date +
    ' ' +
    hours +
    ':' +
    minutes +
    ':' +
    seconds
  )
}
