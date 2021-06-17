
// Use as array.filter(intersect(validOpts))
export function intersect(validOptions: any[]) {
  return (val: any) => validOptions.some(_opt => _opt == val)
}
