Breakout.Colors = {

  hf: {
    /* Reputation */
    a: "#00B500", // rep greEn
    b: "#FF2121", // rep red
    /* Theme */
    c: "#4d2f5d", // dark purple background
    d: "#333333", // background gray
    e: "#1F1F1F", // background dark gray
    /* Groups */
    f: "#fFcC00", // L33t yelLow
    g: "#0066fF", // Ub3r blue
    h: "#afaAaA", // R00t gray
    i: "#ed1c24", // Sociopaths red
    j: "#00cC66", // Divined greEn
    k: "#99cCfF", // Staff blue
    l: "#aA00fF", // Bots purple
    m: "#2D7E52", // Vender greEn
    n: "#9999FF", // Admin purple
    o: "#fFcd94" // Skin tone
  },
  
  arkanoid: {
    w: "#FCFCFC", // white
    o: "#FC7460", // orange
    l: "#3CBCFC", // light blue
    g: "#80D010", // green
    r: "#D82800", // red
    b: "#0070EC", // blue
    p: "#FC74B4", // pink
    y: "#FC9838", // yelLow
    s: "#BCBCBC", // silver
    d: "#F0BC3C"  // gold
  },

  pastel: {
    y: "#FFF7A5", // yelLow
    p: "#FFA5E0", // pink
    b: "#A5B3FF", // blue
    g: "#BFFFA5", // green
    o: "#FFCBA5"  // orange
  },

  vintage: {
    a: "#EFD279", // yelLow
    b: "#95CBE9", // light blue
    c: "#024769", // dark blue
    d: "#AFD775", // light greEn
    e: "#2C5700", // grass
    f: "#DE9D7F", // red
    g: "#7F9DDE", // purple
    h: "#00572C", // dark greEn
    i: "#75D7AF", // mint
    j: "#694702", // brown
    k: "#E9CB95", // peach
    l: "#79D2EF"  // blue
  },

  liquidplanNer: {
    a: '#62C4E7', // light blue
    b: '#00A5DE', // dark  blue
    x: '#969699', // light gray
    y: '#7B797E'  // dark  gray
  },

};

Breakout.Levels = [

  { colors: {
      a: '#000000', // black
      b: '#C3FF00', // yelLow-greEn
      c: '#00FFFF', // cyan
      d: '#FF00FF', // magenta
    },
	name: "Windows 93.11 by EnderAndrew",
    bricks: [
      "","",
       "                aAaA         ",
       "              aAaAaAaA       ",
       "       a     aAabBbBaAa      ",
       "       a a aAaAbaBbabAa      ",
       "         aAaAaAbaBbabAa      ",
       "       c     aAbBbBbBaA      ",
       "       c c cCaAbBbBbBaA      ",
       "         cCcCaAbabBabaA      ",
       "       d     aAbBaAbBaA      ",
       "       d d dDaAbBbBbBaA      ",
       "         dDdDaAbaAaAbaA      ",
       "       a     aAaAaAaAaA      ",
       "       a a aAaAa    aAa      ",
       "         aAaAa        a      ",
    ]
  },
  
  { colors: {
      a: '#543746', // dark-purple
      b: '#B97C1F', // brown
      c: '#EDAE48', // light-brown
      d: '#FEDDAD', // tan
	  e: '#887B66', // dark
	  f: '#DFD7AD', // light
	  g: '#DFD7AD', // white
    },
	name: "Doge by EnderAndrew",
    bricks: [
      "","","",
       "             aA   a   ",
       "            adDaAada  ",
       "            adcCcCca  ",
       "            adcCcCcCa ",
       "            acCcCcCaga",
       "        a  acCcCagcCca",
       "       ada acCfFcCcaAfa",
       "       adDacCcfFfFfFafa",
       "       acdabcCefFaAafFa",
       "        acCabBbefFfFfea",
       "         aAaAbBeEeEeEa",
       "            aAaAaAaAa ",
    ]
  },

  {
    colors: Breakout.Colors.arkanoid,
    name: "Pac-Man by EnderAndrew",
    bricks: [
      "", "",
      "     rrrr            yyyyy   ",
      "   rrrrrrrr        yyyyyyyyy ",
      "  rrrrrrrrrr     yyyyyyyyyyyy",
      " rwwrrrrwwrrr   yyyyyyyyyyyyy",
      " wwwwrrwwwwrr   yyyyyyyyyyyyyy",
      " lLwwrrlLwwrr     yyyyyyyyyyyy",
      "rlLwwrrlLwwrrr       yyyyyyyyy",
      "rrwwrrrrwwrrrr          yyyyyy",
      "rrrrrrrrrrrrrr       yyyyyyyyy",
      "rrrrrrrrrrrrrr    yyyyyyyyyyy",
      "rrrrrrrrrrrrrr  yyyyyyyyyyyyy",
      "rrrrrrrrrrrrrr  yyyyyyyyyyyy ",
      "rrrr rrrr rrrr   yyyyyyyyyy  ",
      " rr   rr   rr      yyyyy     ",
    ]
  }, 

  { colors: {
      a: '#000000', // black
      b: '#AC385D', // dark purple
      c: '#B56BA6', // light purple
      d: '#83978C', // grey
      e: '#1B9BD8', // blue
      f: '#FFFFFF', // white
    },
	name: "Among Us by EnderAndrew",
    bricks: [
      "","","",
      "         aAaA       a a      ",
      "        acCaAa     afafa     ",
      "       acCadefa    afFfa     ",
      "      aAcCadeEa     afa      ",
      "     acabcadDda     afa      ",
      "     ababcCaAa  aAaAaAaAa    ",
      "     ababBcCca  ababBcCca    ",
      "     ababBbBba  ababBbBba    ",
      "      aAbBbBba  aAabBbBba    ",
      "       abBabBa    abBabBa    ",
      "        aA aA      aA aA     ",
    ]
  },

  { colors: {
      a: '#000000', // black
      b: '#595656', // grey
      c: '#FFFFFF', // white
      d: '#962F4D', // pink
	  e: '#D8625D', // peach
	  f: '#915A73', // dark-lavender
	  g: '#B38D95', // light-lavender
    },
	name: "Possie by EnderAndrew",
    bricks: [
      "","","",
       "         aA   aAaA           ",
       "       aAbBaAabBbBa          ",
       "      acbababBbBbBba         ",
       "    aAcCcbBbBbBbBbBa    aAa  ",
       "  aAcCcacCcbBbBbBbBba  agGga ",
       "  adcCcCcCcCbBbBbBbBfaAagaga ",
       "   aAcCcCcCbBbBbBbBbfFfaAaga ",
       "     aAaAaAabBbBbBaAaAfFgGga ",
       "        aeabBaeaBba   aAaAa  ",
       "         aeEa aeEa           ",
    ]
  },

  { colors: Breakout.Colors.arkanoid,
	name: "Space Invaders",
    bricks: [
      "", "",
      "          yy      yy          ",
      "            yy  yy            ",
      "            yy  yy            ", 
      "          ssSSssSSss          ",
      "          ssSSssSSss          ",
      "        SSsswwsswwssSS        ",
      "        SSsswwsswwssSS        ",
      "      ssSSssSSssSSssSSss      ",
      "      ssSSssSSssSSssSSss      ",
      "      ss  ssSSssSSss  ss      ",
      "      ss  ss      ss  ss      ",
      "      ss  ss      ss  ss      ",
      "            ss  ss            ",
      "            ss  ss            ",
    ]
  },

  { colors: Breakout.Colors.arkanoid,
    name: "Retro by EnderAndrew",
    bricks: [
      "","","",
       " wdw  wdwo ysdwo wdw    yp   d",
       " o  o o      l   o  o  s  b  s",
       " l  l l      g   l  l w    r y",
       " g  g g      r   g  g o    g p",
       " rbr  rlg    b   rbr  g    l b",
       " b p  b      p   b p  r    o r",
       " p  y p      y   p  y b    w g",
       " y  s y      s   y  s  p  d   ",
       " s  d srbp   d   s  d   ys   l",
    ]
  },

  { colors: Breakout.Colors.arkanoid,
    name: "Classic Arkanoid",
    bricks: [
      "",
      "oo",
      "ooll",
      "oollgg",
      "oollggbb",
      "oollggbbrr",
      "oollggbbrroo",
      "oollggbbrrooll",
      "oollggbbrroollgg",
      "oollggbbrroollggbb",
      "oollggbbrroollggbbrr",
      "oollggbbrroollggbbrroo",
      "oollggbbrroollggbbrrooll",
      "oollggbbrroollggbbrroollgg",
      "oollggbbrroollggbbrroollggbb",
      "ssSSssSSssSSssSSssSSssSSssSSrr"
    ]
  },

  { colors: {
      a: '#000000', // black
      b: '#5E7985', // blue-grey
      c: '#424242', // dark-grey
      d: '#6F6F6F', // light-grey
	  e: '#FFFFFF', // white
	  f: '#9B2525', // red
    },
	name: "NES Controller by EnderAndrew",
    bricks: [
      "",
       "          a                  ",
       "          aA                 ",
       "           a                 ",
       "           aAa               ",
       "             a               ",
       "  bBbBbBbBbBbBbBbBbBbBbBbBb  ",
       "  bcCcCcCcbBbBbBbcCcCcCcCcb  ",
       "  bcCcCcCcCcCcCcCcCfFfFfcCb  ",
       "  bcCcCcCcbBbBbBbcCcCcCcCcb  ",
       "  bcCcCcCcCcCcCcCcCcCcCcCcb  ",
       "  bcCbBbcCdDdDdDdcdDdDdDdcb  ",
       "  bcbBdbBdeEeEeEedeEeEeEedb  ",
       "  bcbdcdbdedDedDedefFefFedb  ",
       "  bcbBdbBdeEeEeEedefFefFedb  ",
       "  bcCbBbcCdDdDdDdceEeEeEedb  ",
       "  bcCcCcCcbBbBbBbcdDdDdDdcb  ",
       "  bBbBbBbBbBbBbBbBbBbBbBbBb  ",
    ]
  },

  { colors: Breakout.Colors.arkanoid,
    name: "Arkanoid Umbrella",
    bricks: [
      "", "",
      "              ss              ",
      "          bbBBssggGG          ",
      "        BBbbWWwwWWGGgg        ",
      "      bbBBwwWWwwWWwwggGG      ",
      "      bbBBwwWWwwWWwwggGG      ",
      "      bbBBwwWWwwWWwwggGG      ",
      "      ss  ss  ss  ss  ss      ",
      "              ss              ",
      "              ss              ",
      "          oo  oo              ",
      "          ooOOoo              ",
      "            OO                "
    ]
  },

  { colors: {
      a: '#22481C', // dark greEn
      b: '#3C9D30', // light greEn
      c: '#000000', // black
      d: '#FFFFFF', // white
      e: '#E9A3C0', // light pink
      f: '#BF1864', // dark pink
      g: '#643800', // brown
      h: '#FDC98D'  // tan
    },
    name: "Grogu by EnderAndrew",
    bricks: [
      "",
      "            aAaAaA           ",
      "           abBbBbBa          ",
      "     aAabaAbBbBbBbBaAbaAa    ",
      "     aAbBbacCcbBcCcabBbaA    ",
      "     eEfbBbcCdbBcCdbBbfeE    ",
      "      eEabBcCcbBcCcbBaeE     ",
      "       eEaAbBbBbBbBaAeE      ",
      "        cgGgGgGgGgGgGc       ",
      "        chHhgGgGgGhHhc       ",
      "         chgGgGgGgGhc        ",
      "         chHghgGhghHc        ",
      "         bchghgGhghcb        ",
      "          chghgGhghc         ",
      "          cgGhgGhgGc         ",
      "           chHgGhHc          ",
      "            cCcCcC           ",
    ]
  },

  { colors: {
      a: '#000000', // black
      b: '#797979', // dark-grey
      c: '#BCBCBC', // light-grey
      d: '#F7B606', // yelLow
	  e: '#F8D776', // light-yelLow
	  f: '#EFD1AD', // peach
	  g: '#0000BA', // blue
	  h: '#4228BD', // purple
	  i: '#4F3400', // dark-brown
	  j: '#AA7B09', // tan
	  k: '#FD3502', // red
    },
	name: "Cloud Strife by EnderAndrew",
    bricks: [
      "",
       "              d              ",
       "      a        dD            ",
       "      aA       dDd   d       ",
       "      baA     dDdDdDd        ",
       "      baAa   dedDdDded       ",
       "      baAaA d dedDdedDd      ",
       "      cCaAaA dDdDfdDdDdD     ",
       "       cCaAaAdDdDfdfdDd      ",
       "        cCaAaAdDgfFgfd       ",
       "         cCaAaAdfFfFfd       ",
       "          cCaAaAfFfFfd       ",
       "           cCaAaAhHb d       ",
       "            cCaAbGgf         ",
       "             cCbjgf          ",
       "              b iji          ",
       "                gGk          ",
       "                g Gg         ",
       "               aA  aA        ",
    ]
  },

  { colors: {
      a: '#FFA32B', // orange
      b: '#EB6307', // brown
      c: '#C7E666', // greEn
      d: '#FD3B11', // red
      e: '#FFFFFF', // white
    },
	name: "Link by EnderAndrew",
    bricks: [
      "",
      "        cCcCcC      adDda    ",
      "       cCcCcCcC     dadad    ",
      "     a cbBbBbBc a  edDdDdDe  ",
      "     a bBbBbBbB a  edaAadDe  ",
      "     aAbacaAcabaA  edaAadDe  ",
      "     aAbabaAbabaA   edadDe   ",
      "      aAaAaAaAaAb   daAade   ",
      "      cCaAbBaAcCb   adada    ",
      "    bBbBbaAaAcCbBb  aedea    ",
      "   bBabBbBcCcCcabB aedDdea   ",
      "   baAabBabBcCaAab   ada e   ",
      "   bBabBbacbBbBaAa   aAad    ",
      "   bBabBbabBcCcCa    aA      ",
      "   bBbBbBacCcCc      a       ",
      "    aAaAab  bBb      a       ",
      "       bBb           d       ",
    ]
  },

  { colors: {
      b: '#111111', // black,
      w: '#EEEEEE', // white,
      c: '#EC7150', // cherry,
      s: '#B33A2F'  // shadow,
    },
    name: "Cherries!",
    bricks: [
      "",
      "       bBb                    ",
      "      BcCcB                   ",
      "     bCwCcsb  b               ",
      "     bCcCcsb b                ",
      "      BcCsB B                 ",
      "    BbBsSsBbB       bBb       ",
      "   bcCcbBbcCcb     BcCcB      ",
      "  bcwcCsbcwcCsb   bCwCcsb  b  ",
      "  bcCcCsbcCcCsb   bCcCcsb b   ",
      "  bcCcsSbcCcsSb    BcCsB B    ",
      "   bsSsb bsSsb   BbBsSsBbB    ",
      "    bBb   bBb   bcCcbBbcCcb   ",
      "               bcwcCsbcwcCsb  ",
      "               bcCcCsbcCcCsb  ",
      "               bcCcsSbcCcsSb  ",
      "                bsSsb bsSsb   ",
      "                 bBb   bBb    ",
      "                              ",
      "                              ",
      "                              ",
      "                              ",
    ]
  },

  { colors: {
      r: '#D80000', // red
      b: '#706800', // brown
      o: '#F8AB00', // orange
      f: '#F83800', // fire
      w: '#FFFFFF', // white
      e: '#FFE0A8'  // beige
    },
    name: "My Boy Mario",
    bricks: [
      "",
      "    rRrRr                     ",
      "   RrRrRrRrR                  ",
      "   BbBoObo                    ",
      "  boboOoboOo       F    f   f ",
      "  bobBoOoboOo     f e         ",
      "  bBoOoObBbB       F  f     e ",
      "    oOoOoOo        Ff      E  ",
      "   bBrbBb        E  f fF F  f ",
      "  bBbrbBrbBb       FfFfFf  F  ",
      " bBbBrRrRbBbB     fFeFeFfFf   ",
      " oObrorRorboO    FfEeEeEfF    ",
      " oOorRrRrRoOo    FeEeWwEeFf   ",
      " oOrRrRrRrRoO   fFeFwWfEeFf   ",
      "   rRr  RrR     fFeFwWfEeFf   ",
      "  bBb    bBb    fFeEwWeEeFf   ",
      " bBbB    bBbB   fFfEeEeEfF    ",
      "                 FfFfFfFfF    ",
      "                   FfFfF      "
    ]
  },

  {
    colors: Breakout.Colors.hf,
    name: "Galaga by xadamxk",
    bricks: [
      "     jJj    jJj    jJj        ",
      "    jJfjJ  jJfjJ  jJfjJ       ",
      "    jfFfj  jfFfj  jfFfj       ",
      "    j   j  j   j  j   j       ",
      "                              ",
      "   b  b  b  b  b  b  b  b     ",
      "   bnNb  bnNb  bnNb  bnNb     ",
      "    nN    nN    nN    nN      ",
      "   bnNb  bnNb  bnNb  bnNb     ",
      "   b  b  b  b  b  b  b  b     ",
      "",
      "             jJ               ",
      "            jfFj              ",
      "            jfFj              ",
      "    ik      j  j      ki      ",
      "  ifFfk     j  j     kfFfi    ",
      "  kfFfFk   g    g   kfFfFk    ",
      "   kfFf     gGgG     fFfk     ",
      "    kf    g      g    fk      ",
      "           g    g             ",
      "         g  gGgG  g           ",
      "          g      g            ",
      "           gGgGgG             "
    ]
  },
  
  { colors: Breakout.Colors.vintage,
	name: "Tetris by EnderAndrew",
    bricks: [
      "",
      "            e                ",
      "            eE               ",
      "             e               ",
      "                             ",
      "                             ",
      "         aAa                 ",
      "         akf  l      kK      ",
      "     gG eEkfF lLl   lkKea    ",
      "     gGeElkKfgGafFflLeEea    ",
      "     fFflLlegGaAafelgGgaA    ",
      "     fkaAfeEekKkKleEfFgkK    ",
      "     kKaAflLlaAfFleafFkKf    ",
      "     kleEfFlaAeEflaAgeEef    ",
      "     lLleEgGgGeEflagGgefF    ",
    ]
  },

  { colors: {
      a: '#000000', // black
      b: '#FFFF00', // yelLow
      c: '#FF0000', // red
      d: '#742806', // brown
	  e: '#338715', // greEn
	  f: '#FFE9D1', // peach
	  g: '#FFFFFF', // white
    },
	name: "I Choose You by EnderAndrew",
    bricks: [
      "","",
       "     aAaAaA                 ",
       "    agGcCcCa                ",
       "   aegGcCcCca          aA   ",
       "  aAegGcCcCca       aAaAaAaAa",
       " acCgGgcCcCaAa   aAabBaAabBba",
       "  aAfFfaAaAaAa  abBbBbBabBba",
       "   afafFaAaAaA abBbBbBaAbBa ",
       "   afafFafFaA  abBbBbBabBa  ",
       "   afFfFfFfa  abBabBbBbabaAa",
       "    afFfFaAea abBbBcbBbabBba",
       "     aAaAaeEa  abBbBbdDdada ",
       "      aAfFaea  ababBbBbBadDa",
       "      aAfFaea  abaAbBdDdada ",
       "     aAaAaAa   abBbBbBbaAa  ",
       "     agGgGa     aAbBbaA     ",
       "      aAaA        aAa       ",
    ]
  },

  { colors: {
      a: '#E3C697', // tan
      b: '#000000', // black
      c: '#FFFFFF', // white
      d: '#416999', // blue
      e: '#BE2F37', // red
      f: '#FEC23C', // orange
    },
	name: "Dig Dug by EnderAndrew",
    bricks: [
      "",
      "aAaAaAaAaAaAaAaAaAaAaAaAaAaAaA",
      "aAaAaAaAaAaAaAaAaAaAaAaAaAaAaA",
      "aAbBbBbBbaAaAaAaAaAaAabBbBbBaA",
      "bBbBcCcbBbaAaAaAaAaAbBbeEeEbBa",
      "bBcCcCcCbBbaAaAaAaAabBfcbfeEbB",
      "bcCcCcCcCcbaAaAaAaAbBfcCbcfeEb",
      "cCcCcCcCcCbBaAaAaAabfFbBbcCfeE",
      "cCcdDdbdbdbBbBbBbBbBefcCcCcCce",
      "cCcCdDbdbdbBbBbBbBbBeEfcCbBbcf",
      "bcdDdDdDdbebBbBbBbBbeEefcbcCfF",
      "bcbBcCcCcbeEbBbfFbBbfeEefFfFfF",
      "eEedDdeEeEeEefFbBfbfbeEeEefefF",
      "bcCcdDdcCbeEbBbBbBfbBbeEeEeEef",
      "bcCcCcCcbBebBbBbBbBbBbBefeEecf",
      "bcCcbBcCbBbBbBbBbBbBbBbBfbBbcb",
      "bBcCcbcCcbBbaAaAaAaAabBfFfbBbc",
      "aAaAaAaAaAaAaAaAaAaAaAaAaAaAaA",
    ]
  },

  { colors: {
      a: '#000000', // black
      b: '#FF0000', // red
      c: '#FF9900', // orange
      d: '#EFE305', // yelLow
	  e: '#00FF00', // greEn
	  f: '#0000FF', // blue
	  g: '#9900FF', // purple
	  h: '#666666', // grey
	  i: '#C98F4C', // tan
	  j: '#FF949D', // pink
	  k: '#FFFFFF', // white
    },
	name: "Nyan Cat by EnderAndrew",
    bricks: [
      "",
       "bB       aAaAaAaAaAaAaA      ",
       "bBbBbBbBaiIiIiIiIiIiIiIa     ",
       "cCbBbBbaiIjJjJgjJgjJjiIia    ",
       "cCcCcCcaijJgjJjJaAjJjJjia aA ",
       "daAaAcCaijJjJjJahHajJgjiaAhHa",
       "ahHhaAaAijJjJjJahHhajJjiahHha",
       "aAhHhHhaijJjgjJahHhHaAaihHhHa",
       "eEaAaAhaijJjJjJahHhHhHhHhHhHa",
       "fFfFfaAaijJjJgahHhkahHhHhkahHa",
       "fFfFfFfaijgjJjahHhaAhHhahaAhHa",
       "gGfFfFfaijJjgjahjJhHhHhHhHhjJa",
       "gGgGgGaAiIjgjJahjJhahHahHahjJa",
       "  gGaAaAiIijJjJahHhaAaAaAahHa",
       "   ahHhaAiIiIiIiahHhHhHhHhHa ",
       "   ahHa aAaAaAaAaAaAaAaAaAa  ",
       "   aAa   ahHa   ahHa ahHa    ",
       "          aAa    aAa  aAa    ",
    ]
  },

  {
    colors: Breakout.Colors.hf,
    name: "Portal by Adam",
    bricks: [
       " fF                        kK ",
       " fF                        kK ",
       " fF                        kK ",
       " fF   hH                   kK ",
       " fF  hHhH                  kK ",
       " fF  hHhH                  kK ",
       " fFh  hH                   kK ",
       " fFhHh                     kK ",
       " fFhHhH                hH hkK ",
       " fFhHhHhH             hHhHhkK ",
       " fFhHh hHh           hHh hHkK ",
       " fFhH   hHh         hHh  hHkK ",
       " fFhH    hH          h   hHkK ",
       " fFh                     hHkK ",
       " fFhH               h   hHhkK ",
       " fF hH             hHh hHhHkK ",
       " fF  hH             hHhHh hkK ",
       " fF hH               hHh   kK ",
       " fFhH                 h    kK ",
       " fF                        kK ",
    ]
  },
  
  {
    colors: Breakout.Colors.hf,
    name: "Nintendo 64 by EnderAndrew",
    bricks: [
       "            kKkKk             ",
       "         nNcknNnkcnN          ",
       "        kKkKkKkKkKkKk         ",
       "       kncnkKkKkKknfnk        ",
       "       kcCckKkKkKkfnfk        ",
       "       kncnkKkbkKjnfnk        ",
       "       nkKkKkKkKkKgkKn        ",
       "       knkKkKcCckKkKnk        ",
       "       kKnNnkcncknNnkK        ",
       "       kKk  ncCcn  kKk        ",
       "       kKk  nkKkn  kKk        ",
       "       nkn   kKk   nkn        ",
       "        n    kKk    n         ",
       "             nknh             ",
       "              n h             ",
       "                hHh           ",
       "                  h           ",
       "                  hH          ",
       "                   hH         ",
       "                    hH        ",
       "                     h        ",
    ]
  },

  {
    colors: Breakout.Colors.hf,
    name: "GameCube by EnderAndrew",
    bricks: [
       "           gGgGgGg            ",
       "       gGgGgkKkKkgGgGg        ",
       "      gkKkgGgGgGgGghHkg       ",
       "     gk h kgGghgGgkKjJhg      ",
       "     gkhHhkgGgGgGgbkaAhg      ",
       "     gk h kKg   gkKkKkKg      ",
       "     gGkKkKhkg gfofkKkgG      ",
       "     gGgGkhHhg goOokgGgG      ",
       "     gGg gkhkg gfofg gGg      ",
       "     gGg  gGg   gGG  gGg      ",
       "     gGg        h    gGg      ",
       "      g         hH    g       ",
       "                 hH           ",
       "                  hH          ",
       "                   hH         ",
       "                    h         ",
       "                    hH        ",
       "                     h        ",
       "                     h        ",
       "                     hH       ",
       "                      h       ",
       "                      h       "
    ]
  },
 
  {
    colors: Breakout.Colors.hf,
    name: "Galaga by xadamxk",
    bricks: [
      "     jJj    jJj    jJj        ",
      "    jJfjJ  jJfjJ  jJfjJ       ",
      "    jfFfj  jfFfj  jfFfj       ",
      "    j   j  j   j  j   j       ",
      "                              ",
      "   b  b  b  b  b  b  b  b     ",
      "   bnNb  bnNb  bnNb  bnNb     ",
      "    nN    nN    nN    nN      ",
      "   bnNb  bnNb  bnNb  bnNb     ",
      "   b  b  b  b  b  b  b  b     ",
      "",
      "             jJ               ",
      "            jfFj              ",
      "            jfFj              ",
      "    ik      j  j      ki      ",
      "  ifFfk     j  j     kfFfi    ",
      "  kfFfFk   g    g   kfFfFk    ",
      "   kfFf     gGgG     fFfk     ",
      "    kf    g      g    fk      ",
      "           g    g             ",
      "         g  gGgG  g           ",
      "          g      g            ",
      "           gGgGgG             "
    ]
  },
  
  { colors: Breakout.Colors.hf,
	name: "AOL by EnderAndrew",
    bricks: [
      "                              ",
      "                              ",
      "       gGg                    ",
      "      gfFfg                   ",
      "      gfFfg                   ",
      "      gfFfg                   ",
      "      gGgGg                   ",
      "     gfFfFgGg                 ",
      "     gfFfFfFg  gG   gG  g     ",
      "    gfFfgfFfg g  g g  g g     ",
      "    gfFfFgGg  g  g g  g g     ",
      "   gfFfFfFg   g  g g  g g     ",
      "  gfFfgGfFg   gGgG g  g g     ",
      "  gfFg  gfFg  g  g g  g g     ",
      "   gG    gG   g  g  gG  gGgG  ",
    ]
  },

  {
    colors: Breakout.Colors.hf,
    name: "Frog Award by Mix3rz",
    bricks: [
      "                              ",
      "                              ",
      "                              ",
      "         dDd      dDd         ",
      "        dfFfd    dfFfd        ",
      "       dfdDfFdDdDfFdDfd       ",
      "       dfdDfFaAaAfFdDfd       ",
      "       dfFfFfaAaAfFfFfd       ",
      "        dfFfaAaAaAfFfd        ",
      "       daAaAaAaAaAaAaAd       ",
      "      daAdaAaAaAaAaAdaAd      ",
      "      daAadDdDdDdDdDaAad      ",
      "       daAaAaAaAaAaAaAd       ",
      "        dDdaAaAaAaAdDd        ",
      "         daAaAaAaAaAd         ",
      "       dDaAaAamMaAaAadD       ",
      "      dmdaAaAmMmMaAaAdmd      ",
      "      dmMmdmdmMmMdmdmMmd      ",
      "       dDd d dDdD d dDd       ",
      "                              ",
      "                              ",
      "                              "
    ]
  },

  {
    colors: Breakout.Colors.hf,
    name: "Ace of Spades by Mix3rz",
    bricks: [
      "                              ",
      "  e                           ",
      " e e         dD               ",
      " eEe        dDeE              ",
      " e e       deEeEe             ",
      "           dEeEeE             ",
      "          dEeEeEeE            ",
      "          dEeEeEeE            ",
      "         dEeEeEeEeE           ",
      "         dEeEeEeEeE           ",
      "        dEeEeEeEeEeE          ",
      "        dEeEeEeEeEeE          ",
      "       dEeEeEeEeEeEeE         ",
      "       dEeEeEeEeEeEeE         ",
      "             eE               ",
      "            eEeE              ",
      "           eEeEeE             ",
      "          eEeEeEeE        e e ",
      "          eEeEeEeE        eEe ",
      "                          e e ",
      "                           e  ",
      "                              "
    ]
  },

  { colors: {
      a: '#7FFD44', // light greEn
      b: '#56B428', // greEn
      c: '#AE7349', // tan
      d: '#7A4E33', // brown
      e: '#5A3724', // dark brown
	  f: '#A19B9B', // light grey
	  g: '#665C64', // dark grey
    },
	name: "Minecraft by EnderAndrew",
    bricks: [
      "",
      "       aAabBabaAaAaAaba      ",
      "       aAaAaebBbaAabaAa      ",
      "       aeabBebeaAaAebBe      ",
      "       egeEbeEebebedeEd      ",
      "       cdcCecCceEegdced      ",
      "       decCeceEedDedDdc      ",
      "       cedDfdDcCdcCdcdc      ",
      "       cdcCcCdDcCcCdDcC      ",
      "       cdDcdcdcdcCdDded      ",
      "       cCedDeEdDdDdcCdc      ",
      "       cCdcCdcCcCcdcCfd      ",
      "       cdDcCcdcgcCdecde      ",
      "       decdcCcdDdDdDdcC      ",
      "       dcdDedcCdecedcCc      ",
      "       cdecdcdcdDdedDcC      ",
      "       cdcCcdgcCcdDcCde      ",
    ]
  },
  
  { colors: Breakout.Colors.pastel,
    name: "Six Pack",
    bricks: [
      "", "",
      "  yyYYyyYYyyYY  YYyyYYyyYYyy  ",
      "  bbBBbbBBbbBB  BBbbBBbbBBbb  ",
      "  ggGGggGGggGG  GGggGGggGGgg  ",
      "  ooOOooOOooOO  OOooOOooOOoo  ",
      "", "",
      "  yyYYyyYYyyYY  YYyyYYyyYYyy  ",
      "  bbBBbbBBbbBB  BBbbBBbbBBbb  ",
      "  ggGGggGGggGG  GGggGGggGGgg  ",
      "  ooOOooOOooOO  OOooOOooOOoo  ",
      "", "",
      "  yyYYyyYYyyYY  YYyyYYyyYYyy  ",
      "  bbBBbbBBbbBB  BBbbBBbbBBbb  ",
      "  ggGGggGGggGG  GGggGGggGGgg  ",
      "  ooOOooOOooOO  OOooOOooOOoo  "
    ]
  },

  { colors: Breakout.Colors.vintage,
    name: "Louvre Inverted Pyramid",
	bricks: [
      "", "", "",
      "   AAaaAAaaAAaaAAaaAAaaAAaa   ",
      "    BBbbBBbbBBbbBBbbBBbbBB    ",
      "     CCccCCccCCccCCccCCcc     ",
      "      DDddDDddDDddDDddDD      ",
      "       EEeeEEeeEEeeEEee       ",
      "        FFffFFffFFffFF        ",
      "         GGggGGggGGgg         ",
      "          HHhhHHhhHH          ",
      "           IIiiIIii           ",
      "            JJjjJJ            ",
      "             KKkk             ",
      "              LL              "
    ]
  },

  { colors: Breakout.Colors.vintage,
    name: "Love Triangles",
	bricks: [
      "", "",
      "  aabbccddeeffggFFEEDDCCBBAA  ",
      "   aabbccddeeffFFEEDDCCBBAA   ",
      "    aabbccddeeffEEDDCCBBAA    ",
      "     aabbccddeeEEDDCCBBAA     ",
      "      aabbccddeeDDCCBBAA      ",
      "       aabbccddDDCCBBAA       ",
      "        aabbccddCCBBAA        ",
      "         aabbccCCBBAA         ",
      "          aabbccBBAA          ",
      "      hh   aabbBBAA   hh      ",
      "     hhHH   aabbAA   hhHH     ",
      "    hhiiHH   aaAA   hhiiHH    ",
      "   hhiiIIHH   aa   hhiiIIHH   ",
      "  hhiijjIIHH      hhiijjIIHH  ",
      " hhiijjJJIIHH    hhiijjJJIIHH "
    ]
  },

  { colors: Breakout.Colors.pastel,
    name: "You've Got Mail",
	bricks: [
      "                              ",
      "                              ",
      "  bbBBbbBBbbBBbbBBbbBBbbBBbb  ",
	  "  ooyyYYyyYYyyYYyyYYyyYYyyoo  ",
	  "  ooyyYYyyYYyyYYyyYYyyYYyyoo  ",
	  "  ooOOYYyyYYyyYYyyYYyyYYOOoo  ",
	  "  ooOOooyyYYyyYYyyYYyyooOOoo  ",
	  "  oobbooOOYYyyYYyyYYOOoobboo  ",
	  "  oobbBBOOooyyYYyyooOOBBbboo  ",
	  "  ooppBBbbOOooYYooOObbBBppoo  ",
	  "  ooppPPbbBBooOOooBBbbPPppoo  ",
	  "  ooppPPppBBbbOObbBBppPPppoo  ",
	  "  ooppPPppPPbbBBbbPPppPPppoo  ",
	  "  ooppPPppPPppBBppPPppPPppoo  ",
	  "  ooppPPppPPppPPppPPppPPppoo  ",
	  "  ooggGGggGGggGGggGGggGGggoo  ",
	  "  ooggGGggGGggGGggGGggGGggoo  ",
	  "  bbBBbbBBbbBBbbBBbbBBbbBBbb  ",
    ]
  },

  
  { colors: Breakout.Colors.hf,
    name: "Test",
    bricks: [
      "fffffFFFFFfffffFFFFFfffffFFFFf",
      "ggGggGGGGGgggggGGGGGgggggGGGGG",
      "hhhhhHHHHHhhhhhHHHHHhhhhhHHHHH",
      "iiiiiIIIIIiiiiiIIIIIiiiiiIIIII",
      "jjjjjJJJJJjjjjjJJJJJjjjjjJJJJJ",
      "kkkkkKKKKKkkkkkKKKKKkkkkkKKKKK",
      "lllllLLLLLlllllLLLLLlllllLLLLL",
      "mmmmmMMMMMmmmmmMMMMMmmmmmMMMMM",
      "nnnnnNNNNNnnnnnNNNNNnnnnnNNNNN",
      "iiiiiIIIIIiiiiiIIIIIiiiiiIIIII",
      "jjjjjJJJJJjjjjjJJJJJjjjjjJJJJJ",
      "kkkkkKKKKKkkkkkKKKKKkkkkkKKKKK",
      "lllllLLLLLlllllLLLLLlllllLLLLL",
      "mmmmmMMMMMmmmmmMMMMMmmmmmMMMMM",
      "nnnnnNNNNNnnnnnNNNNNnnnnnNNNNN",
      "iiiiiIIIIIiiiiiIIIIIiiiiiIIIII",
      "jjjjjJJJJJjjjjjJJJJJjjjjjJJJJJ",
      "kkkkkKKKKKkkkkkKKKKKkkkkkKKKKK",
      "lllllLLLLLlllllLLLLLlllllLLLLL",
      "mmmmmMMMMMmmmmmMMMMMmmmmmMMMMM",
      "nnnnnNNNNNnnnnnNNNNNnnnnnNNNNN"
    ]
  },
  
  { colors: Breakout.Colors.hf,
    name: "Test2",
    bricks: [
      "                              ",
      "       eE eEeEeEeEeEeEeE      ",
      "      eEeEeEe           e     ",
      "    eEe                 eE    ",
      "   eE                    e    ",
      "   e       gG     gG     eE   ",
      "   e       gG     gG      e   ",
      "  eE                      e   ",
      "  e                       e   ",
      "   e                  i   eE  ",
      "   e                  i    e  ",
      "   e                  i    e  ",
      "   e   iIi          iIi    e  ",
      "   eE    iIiIiIiIiIi      eE  ",
      "    eE                    e   ",
      "     eE                   e   ",
      "      eE                 eE   ",
      "        eE              eE    ",
      "         eEeE        eEeE     ",
      "             eEeEeEeEe        ",
    ]
  },

];


