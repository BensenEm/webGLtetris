/*
Level: consists of
 dropspeed, colorset, backgroundpic, backgroundObj, floorObj, maybe additional stones, sound, gameOverAnimation;




*/

function Level(lev){
  this.dropTime;
  this.colorset = new Array();
  this.backgroundpic;
  this.floorObj;
  this.gameOverAnimation;
  this.threshholdScore;

  switch (lev) {
    case 1:
    this.dropTime=2000;
    this.colorset.push(0xffff99);
    this.colorset.push(0xff3366);
    this.colorset.push(0xcc9966);
    this.colorset.push(0x333366);
    this.colorset.push(0x993366);
    this.threshholdScore=199;

      break;
    case 2:
    this.dropTime=1600;
    this.colorset.push(0x9397a4);
    this.colorset.push(0xcad0e2);
    this.colorset.push(0xcd97ff);
    this.colorset.push(0x95b9ff);
    this.colorset.push(0x7bddff);
    this.threshholdScore=399;

      break;

    case 3:
    this.dropTime=1200;
    this.colorset.push(0x195037);
    this.colorset.push(0x0c6e38);
    this.colorset.push(0x1fb33c);
    this.colorset.push(0xbb7e27);
    this.colorset.push(0xefbb29);
    this.threshholdScore=599;
    break;

    default:

  }
}
