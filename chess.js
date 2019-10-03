class Chess{

  /**
   * position map for chesses
   * 0: no chess, 1: black chess, 2: white chess
   */
  static posMap = []

  constructor(id, x, y, color, pos){
    this.id = id
    this.x = x
    this.y = y
    this.color = color
    this.pos = pos
  }
}

export default Chess