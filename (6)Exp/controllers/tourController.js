const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  console.log(`Tour ID is: ${val}`);

  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Invalid ID'
    });
  }
  next();
};

// Must note this point that if we pass the val parameter in here, then it won't work.
// The reason is if there are 4 parameters, then Express will think of it as an Error Handling Parameter, and will only call this, when there is an error.
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'Fail',
      message: 'Missing Name or Price'
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours }
  });
};

exports.getTour = (req, res) => {
  // console.log(req.params);
  const id = req.params.id * 1;
  const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: 'success',
    data: { tour }
  });
};

exports.createTour = (req, res) => {
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    res.status(201).json({
      status: 'success',
      data: { tour: newTour }
    });
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { tour: '<Updated Tour Here>' }
  });
};

exports.deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Invalid ID'
    });
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
};