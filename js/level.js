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
  this.scoreMultiplyer;

  switch (lev) {
    case 1:
    this.dropTime=2000;
    this.colorset.push(0xffff99);
    this.colorset.push(0xff3366);
    this.colorset.push(0xcc9966);
    this.colorset.push(0x333366);
    this.colorset.push(0x993366);
    this.threshholdScore=199;
    this.scoreMultiplyer=1;


      break;
    case 2:
    this.dropTime=1600;
    this.colorset.push(0x9397a4);
    this.colorset.push(0xcad0e2);
    this.colorset.push(0xcd97ff);
    this.colorset.push(0x95b9ff);
    this.colorset.push(0x7bddff);
    this.threshholdScore=399;
    this.scoreMultiplyer=1.5;

      break;

    case 3:
    this.dropTime=1200;
    this.colorset.push(0x195037);
    this.colorset.push(0x0c6e38);
    this.colorset.push(0x1fb33c);
    this.colorset.push(0xbb7e27);
    this.colorset.push(0xefbb29);
    this.threshholdScore=599;
    this.scoreMultiplyer=2;
    break;

    case 4:
    this.dropTime=800;
    this.colorset.push(0xd65454);
    this.colorset.push(0xfdf8dc);
    this.colorset.push(0x9c9c9c);
    this.colorset.push(0x5b5867);
    this.colorset.push(0xea6363);
    this.threshholdScore=799;
    this.scoreMultiplyer=2;
    break;

    case 5:
    this.dropTime=600;
    this.colorset.push(0xaaf455);
    this.colorset.push(0xe9fd4a);
    this.colorset.push(0xfbca32);
    this.colorset.push(0xff8100);
    this.colorset.push(0x874400);
    this.threshholdScore=999;
    this.scoreMultiplyer=3;
    break;

    case 6:
    this.dropTime=400;
    this.colorset.push(0xa0d29e);
    this.colorset.push(0x91b09d);
    this.colorset.push(0x729485);
    this.colorset.push(0x487463);
    this.colorset.push(0x225149);
    this.threshholdScore=1199;
    this.scoreMultiplyer=3;
    break;

    default:
    this.dropTime=200;
    this.colorset.push(0xff94e6);
    this.colorset.push(0xff76a0);
    this.colorset.push(0xd6ff7e);
    this.colorset.push(0xc3fb00);
    this.colorset.push(0x9dfb00);
    this.threshholdScore=100000;
    this.scoreMultiplyer=3;
    break;
  }
}
