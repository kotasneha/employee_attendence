const { stringify } = require('csv-stringify');

exports.generateCSV = (rows) => {
  return new Promise((resolve, reject) => {
    const columns = [
      'employeeId',
      'name',
      'department',
      'date',
      'status',
      'checkInTime',
      'checkOutTime',
      'totalHours'
    ];

    stringify(
      rows,
      { header: true, columns },
      (err, output) => {
        if (err) return reject(err);
        resolve(output);
      }
    );
  });
};
