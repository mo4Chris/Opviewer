const { default: axios } = require('axios');


describe('Connections', () => {
  let connections;
  let env;

  describe('hydro', () => {
    beforeEach(() => {
      connections = require('../../helper/connections')
    })

    it('should GET', () => {
      let spy = spyOn(axios, 'get').and.callFake((url, ops) => {
        expect(url).toEqual('http://mo4-hydro-api.azurewebsites.net/test')
        expect(ops['data']).not.toBeTruthy();
        const headers = ops['headers'];
        expect(headers['content-type']).toEqual('application/json');
        expect(headers['Authorization']).toBeTruthy();
      })
      connections.hydro.GET('/test')
      expect(spy).toHaveBeenCalled();
    })
    it('should POST', () => {
      let spy = spyOn(axios, 'post')
      connections.hydro.POST('/test')
      expect(spy).toHaveBeenCalled();
    })
    it('should PUT', () => {
      let spy = spyOn(axios, 'put')
      connections.hydro.PUT('/test')
      expect(spy).toHaveBeenCalled();
    })
    it('should DELETE', () => {
      let spy = spyOn(axios, 'delete')
      connections.hydro.DELETE('/test')
      expect(spy).toHaveBeenCalled();
    })
  })


  // TODO
  // it('should throw an error if mongoDB fails to connect', async () => {
  //   // I have no idea how to test this...
  // })

  // it('should throw an error if admin DB connector fails to connect', async () => {
  //   // I have no idea how to test this...
  // })

  // it('should throw an error if forecast API fails to connect', async () => {
  //   // I have no idea how to test this...
  // })
})
