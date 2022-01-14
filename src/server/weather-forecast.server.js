const axios = require('axios')

  module.exports = function (
    app,
    logger,
  ) {
    
    app.get('/api/weather-forecasts', (req, res) => {
        axios.get('http://20.105.9.231:5000/metocean_forecasts').then(response =>{
            res.send(response.data)
        }, err =>{
            console.error(err);
        })
    })
    
    app.get('/api/weather-forecast/:id', (req, res) => {
        const id = req.params.id;
        axios.get(`http://20.105.9.231:5000/metocean_forecast/${id}`).then(response =>{
            res.send(response.data)
        }, err =>{
            console.error(err);
        })
    })
  }