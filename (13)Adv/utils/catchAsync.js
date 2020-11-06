module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);

    // The above line of code is same as writing the Below Line of Code
    // fn(req, res, next).catch(err => next(err));
  }
};