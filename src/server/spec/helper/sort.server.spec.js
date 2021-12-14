const { sortByStringField } = require("../../helper/sort")

describe('Sorter', () => {
  it('should sort object', () => {
    const obj1 = {
      a: 'aap',
      b: 'zee',
    }
    const obj2 = {
      a: 'zee',
      b: 'aap',
    }
    const arr = [obj1, obj2];
    expect(sortByStringField(arr, e => e.a)).toEqual([obj1, obj2]);
    expect(sortByStringField(arr, e => e.b)).toEqual([obj2, obj1]);
  })


  it('should sort object by uppercase', () => {
    const obj1 = {
      a: 'aap',
      b: 'Zee',
    }
    const obj2 = {
      a: 'zee',
      b: 'aap',
    }
    const arr = [obj1, obj2];
    expect(sortByStringField(arr, e => e.b)).toEqual([obj2, obj1]);
    expect(sortByStringField(arr, e => e.b, false)).toEqual([obj1, obj2]);
  })

  it('should sort objects if not string', () => {
    const obj1 = {
      a: 'aap',
      b: 'Zee',
    }
    const obj2 = {
      a: 'zee',
      b: null,
    }
    const arr = [obj1, obj2];
    expect(sortByStringField(arr, e => e.b)).toEqual([obj1, obj2]);
  })
})
