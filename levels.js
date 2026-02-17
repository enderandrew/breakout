Breakout.Colors = {

	hf: {
		/* Reputation */
		a: "#00B500", // rep green
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
		j: "#00cC66", // Divined green
		k: "#99cCfF", // Staff blue
		l: "#aA00fF", // Bots purple
		m: "#2D7E52", // Vender green
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
		d: "#F0BC3C" // gold
	},

	pastel: {
		y: "#FFF7A5", // yelLow
		p: "#FFA5E0", // pink
		b: "#A5B3FF", // blue
		g: "#BFFFA5", // green
		o: "#FFCBA5" // orange
	},

	vintage: {
		a: "#EFD279", // yelLow
		b: "#95CBE9", // light blue
		c: "#024769", // dark blue
		d: "#AFD775", // light green
		e: "#2C5700", // grass
		f: "#DE9D7F", // red
		g: "#7F9DDE", // purple
		h: "#00572C", // dark green
		i: "#75D7AF", // mint
		j: "#694702", // brown
		k: "#E9CB95", // peach
		l: "#79D2EF" // blue
	},

	liquidplanNer: {
		a: '#62C4E7', // light blue
		b: '#00A5DE', // dark  blue
		x: '#969699', // light gray
		y: '#7B797E' // dark  gray
	},

};

Breakout.Levels = [

	{
		colors: {
			a: '#000000', // black
			b: '#C3FF00', // yelLow-greEn
			c: '#00FFFF', // cyan
			d: '#FF00FF', // magenta
		}
		, name: "Windows 93.11 by EnderAndrew"
		, theme: "synthwave"
		, bricks: [
			"", ""
			, "                aAaA         "
			, "              aAaAaAaA       "
			, "       a     aAabBbBaAa      "
			, "       a a aAaAbaBbabAa      "
			, "         aAaAaAbaBbabAa      "
			, "       c     aAbBbBbBaA      "
			, "       c c cCaAbBbBbBaA      "
			, "         cCcCaAbabBabaA      "
			, "       d     aAbBaAbBaA      "
			, "       d d dDaAbBbBbBaA      "
			, "         dDdDaAbaAaAbaA      "
			, "       a     aAaAaAaAaA      "
			, "       a a aAaAa    aAa      "
			, "         aAaAa        a      "
		, ]
	},

	{
		colors: {
			a: '#543746', // dark-purple
			b: '#B97C1F', // brown
			c: '#EDAE48', // light-brown
			d: '#FEDDAD', // tan
			e: '#887B66', // dark
			f: '#DFD7AD', // light
			g: '#DFD7AD', // white
		}
		, name: "DOGE! SUCH BREAKOUT!"
		, theme: "city"
		, bricks: [
			"", "", ""
			, "             aA   a   "
			, "            adDaAada  "
			, "            adcCcCca  "
			, "            adcCcCcCa "
			, "            acCcCcCaga"
			, "        a  acCcCagcCca"
			, "       ada acCfFcCcaAfa"
			, "       adDacCcfFfFfFafa"
			, "       acdabcCefFaAafFa"
			, "        acCabBbefFfFfea"
			, "         aAaAbBeEeEeEa"
			, "            aAaAaAaAa "
		, ]
	},

	{
		colors: {
			a: '#000000', // black
			b: '#595656', // grey
			c: '#FFFFFF', // white
			d: '#962F4D', // pink
			e: '#D8625D', // peach
			f: '#915A73', // dark-lavender
			g: '#B38D95', // light-lavender
		}
		, name: "Possie by EnderAndrew"
		, theme: "forest"
		, bricks: [
			"", "", ""
			, "         aA   aAaA           "
			, "       aAbBaAabBbBa          "
			, "      acbababBbBbBba         "
			, "    aAcCcbBbBbBbBbBa    aAa  "
			, "  aAcCcacCcbBbBbBbBba  agGga "
			, "  adcCcCcCcCbBbBbBbBfaAagaga "
			, "   aAcCcCcCbBbBbBbBbfFfaAaga "
			, "     aAaAaAabBbBbBaAaAfFgGga "
			, "        aeabBaeaBba   aAaAa  "
			, "         aeEa aeEa           "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Pac-Man by EnderAndrew"
		, theme: "synthwave"
		, bricks: [
			"", ""
			, "     rrrr            yyyyy   "
			, "   rrrrrrrr        yyyyyyyyy "
			, "  rrrrrrrrrr     yyyyyyyyyyyy"
			, " rwwrrrrwwrrr   yyyyyyyyyyyyy"
			, " wwwwrrwwwwrr   yyyyyyyyyyyyyy"
			, " lLwwrrlLwwrr     yyyyyyyyyyyy"
			, "rlLwwrrlLwwrrr       yyyyyyyyy"
			, "rrwwrrrrwwrrrr          yyyyyy"
			, "rrrrrrrrrrrrrr       yyyyyyyyy"
			, "rrrrrrrrrrrrrr    yyyyyyyyyyy"
			, "rrrrrrrrrrrrrr  yyyyyyyyyyyyy"
			, "rrrrrrrrrrrrrr  yyyyyyyyyyyy "
			, "rrrr rrrr rrrr   yyyyyyyyyy  "
			, " rr   rr   rr      yyyyy     "
		, ]
	},

	{
		colors: {
			a: '#000000', // black
			b: '#AC385D', // dark purple
			c: '#B56BA6', // light purple
			d: '#83978C', // grey
			e: '#1B9BD8', // blue
			f: '#FFFFFF', // white
		}
		, name: "Among Us by EnderAndrew"
		, theme: "space"
		, bricks: [
			"", "", ""
			, "         aAaA       a a      "
			, "        acCaAa     afafa     "
			, "       acCadefa    afFfa     "
			, "      aAcCadeEa     afa      "
			, "     acabcadDda     afa      "
			, "     ababcCaAa  aAaAaAaAa    "
			, "     ababBcCca  ababBcCca    "
			, "     ababBbBba  ababBbBba    "
			, "      aAbBbBba  aAabBbBba    "
			, "       abBabBa    abBabBa    "
			, "        aA aA      aA aA     "
		, ]
	},

	{
		colors: {
			e: '#000000', // Black
			w: '#FFFFFF', // White
			b: '#FF0000', // Red
			h: '#DDDDDD' // Light Grey (Button)
		}
		, name: "Catch 'em All"
		, theme: "city"
		, bricks: [
			"                              "
			, "                              "
			, "             eEeE             "
			, "           eEbBbBeE           "
			, "          ewWbBbBbBe          "
			, "         ewWbBbBbBbeE         "
			, "         ewbBbBbBbBbe         "
			, "        ewbBbBbBbBbBbe        "
			, "        eEebBbBeEebBbe        "
			, "        eEeEbBewWwebBe        "
			, "        ehweEeEWhWeEeE        "
			, "         ewWweEwWwewe         "
			, "         eWwWwWeEewWe         "
			, "          ehHWwWwWwe          "
			, "           eEhHhHeE           "
			, "             eEeE             "
		]
	},

	{
		colors: {
			e: '#000000', // black
			m: '#DB3C58', // magenta
			o: '#E8B0CA', // pink
		}
		, name: "Poyo Kirby by EnderAndrew"
		, theme: "forest"
		, bricks: [
			""
			, "             eEeEe eE         "
			, "           eEmoOomemoe        "
			, "          emoOoOoOoeoOe       "
			, "         emoOoeoeoOomoe       "
			, "         eoOoOeoeoOomMe       "
			, "        eoOoOoeoeoOoOme       "
			, "       emoOomMoOomMoOoe       "
			, "       eoOmoOoOeoOoOome       "
			, "       eoOmoOoOeoOoOoe        "
			, "        eEeoOoOoOoOome        "
			, "       emMmeoOoOoOoOme        "
			, "       emMmMeoOoOoOme         "
			, "       emMmMeoOoOomeE         "
			, "        emMmMemMmeEmMe        "
			, "         emMeEeEemMmMme       "
			, "          eEe   eEeEeE        "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Space Invaders"
		, theme: "space"
		, bricks: [
			"", ""
			, "          yy      yy          "
			, "            yy  yy            "
			, "            yy  yy            "
			, "          ssSSssSSss          "
			, "          ssSSssSSss          "
			, "        SSsswwsswwssSS        "
			, "        SSsswwsswwssSS        "
			, "      ssSSssSSssSSssSSss      "
			, "      ssSSssSSssSSssSSss      "
			, "      ss  ssSSssSSss  ss      "
			, "      ss  ss      ss  ss      "
			, "      ss  ss      ss  ss      "
			, "            ss  ss            "
			, "            ss  ss            "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Retro by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			"", "", ""
			, " wdw  wdwo ysdwo wdw    yp   d"
			, " o  o o      l   o  o  s  b  s"
			, " l  l l      g   l  l w    r y"
			, " g  g g      r   g  g o    g p"
			, " rbr  rlg    b   rbr  g    l b"
			, " b p  b      p   b p  r    o r"
			, " p  y p      y   p  y b    w g"
			, " y  s y      s   y  s  p  d   "
			, " s  d srbp   d   s  d   ys   l"
		, ]
	},

	{
		colors: {
			s: '#C0C0C0', // Silver
			g: '#FFD700', // Gold
			b: '#4169E1', // Royal Blue
			d: '#222222' // Dark Grey
		}
		, name: "It's Dangerous to go Alone"
		, theme: "forest"
		, bricks: [
			"              s               "
			, "              s               "
			, "              s               "
			, "              s               "
			, "              s               "
			, "              s               "
			, "              s               "
			, "              s               "
			, "             dgd              "
			, "            bbgbb             "
			, "           bBbgbBb            "
			, "          bBbBgBbBb           "
			, "           d  b  d            "
			, "              b               "
			, "              b               "
			, "              b               "
			, "                              "
		]
	},

	{
		colors: {
			c: '#00FFFF', // Cyan
			w: '#FFFFFF', // White
			b: '#0000CC' // Dark Blue (Pupils)
		}
		, name: "Inky"
		, theme: "space"
		, bricks: [
			"                              "
			, "           cccccccc           "
			, "         cccccccccccc         "
			, "        cccccccccccccc        "
			, "       cccccccccccccccc       "
			, "       ccwwbbccccwwbbcc       "
			, "       ccwwbbccccwwbbcc       "
			, "       ccwwbbccccwwbbcc       "
			, "       cccccccccccccccc       "
			, "       cccccccccccccccc       "
			, "       cccccccccccccccc       "
			, "       cccccccccccccccc       "
			, "       cccccccccccccccc       "
			, "       cc  cc    cc  cc       "
			, "       c    c    c    c       "
			, "                              "
		]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Heart"
		, theme: "forest"
		, bricks: [
			"                              "
			, "                              "
			, "                              "
			, "          rpr     rpr         "
			, "         rprpr   rprpr        "
			, "        rprprpr rprprpr       "
			, "        rprprprprprprpr       "
			, "        rprprprprprprpr       "
			, "         rprprprprprpr        "
			, "          rprprprprpr         "
			, "           rprprprpr          "
			, "            rprprpr           "
			, "             rprpr            "
			, "              rpr             "
			, "               r              "
			, "                              "
		, ]
	},

	{
		colors: {
			g: '#00AA00', // Green
			l: '#55FF55', // Light Green
			b: '#000000' // Black
		}
		, name: "Creeper by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			"          llllllllll          "
			, "          llllllllll          "
			, "        llggllggllggll        "
			, "        llggllggllggll        "
			, "        ggbbbggggbbbgg        "
			, "        ggbbbggggbbbgg        "
			, "        ggbbbggggbbbgg        "
			, "        ggbbbggggbbbgg        "
			, "        gggggbbbbggggg        "
			, "        gggggbbbbggggg        "
			, "        gggbbbbbbbbggg        "
			, "        gggbbbbbbbbggg        "
			, "        gggbbbbbbbbggg        "
			, "        gggbbgGgGbbggg        "
			, "        gggbbgGgGbbggg        "
			, "                              "
		]
	},

	{
		colors: {
			g: '#C0C0C0', // Grey Body
			d: '#808080', // Dark Grey details
			s: '#98A200', // Screen Green
			b: '#222222', // Black/Dark Grey
			r: '#8B0000' // Red buttons
		}
		, name: "Handheld '89"
		, theme: "circuit"
		, bricks: [
			"      gggggggggggggggggg      "
			, "      g                g      "
			, "      g dddddddddddddd g      "
			, "      g d            d g      "
			, "      g d ssssssssss d g      "
			, "      g d ssssssssss d g      "
			, "      g d ssssssssss d g      "
			, "      g d ssssssssss d g      "
			, "      g d ssssssssss d g      "
			, "      g d            d g      "
			, "      g dddddddddddddd g      "
			, "      g   no     no    g      "
			, "      g                g      "
			, "      g             r  g      "
			, "      g  b        r   Gg      "
			, "      g bbb          g g      "
			, "      g  b          g gG     "
			, "      g            g g g      "
			, "      gggggggggggggggggg      "
			, "                              "
		]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Classic Arkanoid"
		, theme: "synthwave"
		, bricks: [
			""
			, "oo"
			, "ooll"
			, "oollgg"
			, "oollggbb"
			, "oollggbbrr"
			, "oollggbbrroo"
			, "oollggbbrrooll"
			, "oollggbbrroollgg"
			, "oollggbbrroollggbb"
			, "oollggbbrroollggbbrr"
			, "oollggbbrroollggbbrroo"
			, "oollggbbrroollggbbrrooll"
			, "oollggbbrroollggbbrroollgg"
			, "oollggbbrroollggbbrroollggbb"
			, "ssSSssSSssSSssSSssSSssSSssSSrr"
		]
	},

	{
		colors: {
			a: '#000000', // black
			b: '#5E7985', // blue-grey
			c: '#424242', // dark-grey
			d: '#6F6F6F', // light-grey
			e: '#FFFFFF', // white
			f: '#9B2525', // red
		}
		, name: "NES Controller by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			""
			, "          a                  "
			, "          aA                 "
			, "           a                 "
			, "           aAa               "
			, "             a               "
			, "  bBbBbBbBbBbBbBbBbBbBbBbBb  "
			, "  bcCcCcCcbBbBbBbcCcCcCcCcb  "
			, "  bcCcCcCcCcCcCcCcCfFfFfcCb  "
			, "  bcCcCcCcbBbBbBbcCcCcCcCcb  "
			, "  bcCcCcCcCcCcCcCcCcCcCcCcb  "
			, "  bcCbBbcCdDdDdDdcdDdDdDdcb  "
			, "  bcbBdbBdeEeEeEedeEeEeEedb  "
			, "  bcbdcdbdedDedDedefFefFedb  "
			, "  bcbBdbBdeEeEeEedefFefFedb  "
			, "  bcCbBbcCdDdDdDdceEeEeEedb  "
			, "  bcCcCcCcbBbBbBbcdDdDdDdcb  "
			, "  bBbBbBbBbBbBbBbBbBbBbBbBb  "
		, ]
	},


	{
		colors: {
			a: "#00B500", // green
			b: "#FF2121", // 
			c: "#4d2f5d", // 
			d: "#333333", // 
			e: "#000000", // black
			f: "#fFcC00", // 
			g: "#3FBFFF", // blue
			h: "#ffffff", // white
			i: "#FE782F", // 
			j: "#00cC66", // 
			k: "#99cCfF", // 
			l: "#aA00fF", // 
			m: "#2D7E52", // 
			n: "#9999FF", // 
			p: "#F0D0B0" // peach
		}
		, name: "First Fantasy by EnderAndrew"
		, theme: "forest"
		, bricks: [
            "     eEeEeEeE                 "
            ,"   eEhHhHhHhe                 "
            ,"  ehHhHhHhHe    eEeE          "
            ," ehHhHhHhHeE    eiIieE        "
            ,"eheEehHhHhHe     eiIiIeEeEeEe "
            ,"ehiIiehHhHhHe     eiIiIiIiIiIe"
            ," eieEiehHhHhe     eiIiIiIiIeE "
            ,"  epepihHhHe     eiIiIiIeEe   "
            ,"  epepPeEeE    eEiIiIieEpe    "
            ,"  epPpeEhHe   eiIieEeEeEpe    "
            ,"   eEihHhHhe   eEeEegGgeEeE   "
            ,"  ehHihHhHhe     egGeEegGge   "
            ,"  ehHiIhHhHhe   egGgGgGpPge   "
            ,"  eEeEihHhHhHe  egGgGgGpPe    "
            ,"  eiIieiIiIiIi  egegGgGgGe    "
            ," eEeEeEeEeEeEe egGegGgGgGe    "
            ,"              egGgGegGgege    "
            ,"              eEeEeEeEeEeE    "
            ,"                              "
            ,"                              "
            ,"                              "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Arkanoid Umbrella"
		, theme: "city"
		, bricks: [
			"", ""
			, "              ss              "
			, "          bbBBssggGG          "
			, "        BBbbWWwwWWGGgg        "
			, "      bbBBwwWWwwWWwwggGG      "
			, "      bbBBwwWWwwWWwwggGG      "
			, "      bbBBwwWWwwWWwwggGG      "
			, "      ss  ss  ss  ss  ss      "
			, "              ss              "
			, "              ss              "
			, "          oo  oo              "
			, "          ooOOoo              "
			, "            OO                "
		]
	},

	{
		colors: {
			a: '#22481C', // dark greEn
			b: '#3C9D30', // light greEn
			c: '#000000', // black
			d: '#FFFFFF', // white
			e: '#E9A3C0', // light pink
			f: '#BF1864', // dark pink
			g: '#643800', // brown
			h: '#FDC98D' // tan
		}
		, name: "Grogu by EnderAndrew"
		, theme: "space"
		, bricks: [
			""
			, "            aAaAaA           "
			, "           abBbBbBa          "
			, "     aAabaAbBbBbBbBaAbaAa    "
			, "     aAbBbacCcbBcCcabBbaA    "
			, "     eEfbBbcCdbBcCdbBbfeE    "
			, "      eEabBcCcbBcCcbBaeE     "
			, "       eEaAbBbBbBbBaAeE      "
			, "        cgGgGgGgGgGgGc       "
			, "        chHhgGgGgGhHhc       "
			, "         chgGgGgGgGhc        "
			, "         chHghgGhghHc        "
			, "         bchghgGhghcb        "
			, "          chghgGhghc         "
			, "          cgGhgGhgGc         "
			, "           chHgGhHc          "
			, "            cCcCcC           "
		, ]
	},

	{
		colors: {
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
		}
		, name: "Cloud Strife by EnderAndrew"
		, theme: "city"
		, bricks: [
			""
			, "              d              "
			, "      a        dD            "
			, "      aA       dDd   d       "
			, "      baA     dDdDdDd        "
			, "      baAa   dedDdDded       "
			, "      baAaA d dedDdedDd      "
			, "      cCaAaA dDdDfdDdDdD     "
			, "       cCaAaAdDdDfdfdDd      "
			, "        cCaAaAdDgfFgfd       "
			, "         cCaAaAdfFfFfd       "
			, "          cCaAaAfFfFfd       "
			, "           cCaAaAhHb d       "
			, "            cCaAbGgf         "
			, "             cCbjgf          "
			, "              b iji          "
			, "                gGk          "
			, "                g Gg         "
			, "               aA  aA        "
		, ]
	},

	{
		colors: {
			a: '#FFA32B', // orange
			b: '#EB6307', // brown
			c: '#C7E666', // greEn
			d: '#FD3B11', // red
			e: '#FFFFFF', // white
		}
		, name: "Link by EnderAndrew"
		, theme: "forest"
		, bricks: [
			""
			, "        cCcCcC      adDda    "
			, "       cCcCcCcC     dadad    "
			, "     a cbBbBbBc a  edDdDdDe  "
			, "     a bBbBbBbB a  edaAadDe  "
			, "     aAbacaAcabaA  edaAadDe  "
			, "     aAbabaAbabaA   edadDe   "
			, "      aAaAaAaAaAb   daAade   "
			, "      cCaAbBaAcCb   adada    "
			, "    bBbBbaAaAcCbBb  aedea    "
			, "   bBabBbBcCcCcabB aedDdea   "
			, "   baAabBabBcCaAab   ada e   "
			, "   bBabBbacbBbBaAa   aAad    "
			, "   bBabBbabBcCcCa    aA      "
			, "   bBbBbBacCcCc      a       "
			, "    aAaAab  bBb      a       "
			, "       bBb           d       "
		, ]
	},

	{
		colors: {
			b: '#111111', // black,
			w: '#EEEEEE', // white,
			c: '#EC7150', // cherry,
			s: '#B33A2F' // shadow,
		}
		, name: "Cherries!"
		, theme: "synthwave"
		, bricks: [
			""
			, "       bBb                    "
			, "      BcCcB                   "
			, "     bCwCcsb  b               "
			, "     bCcCcsb b                "
			, "      BcCsB B                 "
			, "    BbBsSsBbB       bBb       "
			, "   bcCcbBbcCcb     BcCcB      "
			, "  bcwcCsbcwcCsb   bCwCcsb  b  "
			, "  bcCcCsbcCcCsb   bCcCcsb b   "
			, "  bcCcsSbcCcsSb    BcCsB B    "
			, "   bsSsb bsSsb   BbBsSsBbB    "
			, "    bBb   bBb   bcCcbBbcCcb   "
			, "               bcwcCsbcwcCsb  "
			, "               bcCcCsbcCcCsb  "
			, "               bcCcsSbcCcsSb  "
			, "                bsSsb bsSsb   "
			, "                 bBb   bBb    "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
		, ]
	},

	{
		colors: {
			r: '#D80000', // red
			b: '#706800', // brown
			o: '#F8AB00', // orange
			f: '#F83800', // fire
			w: '#FFFFFF', // white
			e: '#FFE0A8' // beige
		}
		, name: "My Boy Mario"
		, theme: "city"
		, bricks: [
			""
			, "    rRrRr                     "
			, "   RrRrRrRrR                  "
			, "   BbBoObo                    "
			, "  boboOoboOo       F    f   f "
			, "  bobBoOoboOo     f e         "
			, "  bBoOoObBbB       F  f     e "
			, "    oOoOoOo        Ff      E  "
			, "   bBrbBb        E  f fF F  f "
			, "  bBbrbBrbBb       FfFfFf  F  "
			, " bBbBrRrRbBbB     fFeFeFfFf   "
			, " oObrorRorboO    FfEeEeEfF    "
			, " oOorRrRrRoOo    FeEeWwEeFf   "
			, " oOrRrRrRrRoO   fFeFwWfEeFf   "
			, "   rRr  RrR     fFeFwWfEeFf   "
			, "  bBb    bBb    fFeEwWeEeFf   "
			, " bBbB    bBbB   fFfEeEeEfF    "
			, "                 FfFfFfFfF    "
			, "                   FfFfF      "
		]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Galaga by xadamxk"
		, theme: "space"
		, bricks: [
			"     jJj    jJj    jJj        "
			, "    jJfjJ  jJfjJ  jJfjJ       "
			, "    jfFfj  jfFfj  jfFfj       "
			, "    j   j  j   j  j   j       "
			, "                              "
			, "   b  b  b  b  b  b  b  b     "
			, "   bnNb  bnNb  bnNb  bnNb     "
			, "    nN    nN    nN    nN      "
			, "   bnNb  bnNb  bnNb  bnNb     "
			, "   b  b  b  b  b  b  b  b     "
			, ""
			, "             jJ               "
			, "            jfFj              "
			, "            jfFj              "
			, "    ik      j  j      ki      "
			, "  ifFfk     j  j     kfFfi    "
			, "  kfFfFk   g    g   kfFfFk    "
			, "   kfFf     gGgG     fFfk     "
			, "    kf    g      g    fk      "
			, "           g    g             "
			, "         g  gGgG  g           "
			, "          g      g            "
			, "           gGgGgG             "
		]
	},

	{
		colors: Breakout.Colors.vintage
		, name: "Tetris by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			""
			, "            e                "
			, "            eE               "
			, "             e               "
			, "                             "
			, "                             "
			, "         aAa                 "
			, "         akf  l      kK      "
			, "     gG eEkfF lLl   lkKea    "
			, "     gGeElkKfgGafFflLeEea    "
			, "     fFflLlegGaAafelgGgaA    "
			, "     fkaAfeEekKkKleEfFgkK    "
			, "     kKaAflLlaAfFleafFkKf    "
			, "     kleEfFlaAeEflaAgeEef    "
			, "     lLleEgGgGeEflagGgefF    "
		, ]
	},

	{
		colors: {
			a: '#000000', // black
			b: '#FFFF00', // yelLow
			c: '#FF0000', // red
			d: '#742806', // brown
			e: '#338715', // greEn
			f: '#FFE9D1', // peach
			g: '#FFFFFF', // white
		}
		, name: "I Choose You by EnderAndrew"
		, theme: "forest"
		, bricks: [
			"", ""
			, "     aAaAaA                 "
			, "    agGcCcCa                "
			, "   aegGcCcCca          aA   "
			, "  aAegGcCcCca       aAaAaAaAa"
			, " acCgGgcCcCaAa   aAabBaAabBba"
			, "  aAfFfaAaAaAa  abBbBbBabBba"
			, "   afafFaAaAaA abBbBbBaAbBa "
			, "   afafFafFaA  abBbBbBabBa  "
			, "   afFfFfFfa  abBabBbBbabaAa"
			, "    afFfFaAea abBbBcbBbabBba"
			, "     aAaAaeEa  abBbBbdDdada "
			, "      aAfFaea  ababBbBbBadDa"
			, "      aAfFaea  abaAbBdDdada "
			, "     aAaAaAa   abBbBbBbaAa  "
			, "     agGgGa     aAbBbaA     "
			, "      aAaA        aAa       "
		, ]
	},

	{
		colors: {
			a: "#00B500", // green
			b: "#FF2121", // 
			c: "#4d2f5d", // 
			d: "#333333", // 
			e: "#000000", // black
			f: "#fFcC00", // 
			g: "#3FBFFF", // blue
			h: "#ffffff", // white
			i: "#FE782F", // 
			j: "#00cC66", // 
			k: "#99cCfF", // 
			l: "#aA00fF", // 
			m: "#2D7E52", // 
			n: "#9999FF", // 
			p: "#F0D0B0" // peach
		}
		, name: "Bubble Bobble by EnderAndrew"
		, theme: "circuit"
		, bricks: [
            ""
            ,"            e                 "
            ,"           epe                "
            ,"       eEeEpPpeE              "
            ,"      epPpPaAaAae       eEe   "
            ,"       epPaAaAaAae     egGge  "
            ,"      eEeaAaAhHahae   egkK ge "
            ,"     epPpaAahHeaehe   egkKkge "
            ,"      epaAaAhHeaehe   egkKkge "
            ,"      eEaAaAhHeaehae   egGge  "
            ,"     epPaAaAhHeaehae    eEe   "
            ,"      epaAaAahHahaAe          "
            ,"      eEapaAeEeheEe           "
            ,"    e eapPpaAaAaAae           "
            ,"   eaeEapPpaAhHhHeE           "
            ,"   eapPapPaAhHhHhHe           "
            ,"    eaAaAaApPhHhHheE          "
            ,"     ejJjJpPpPhHhpPpe         "
            ,"     eEeEeEeEeEeEeEe          "
		]
	},
	
	{
		colors: {
			a: "#00B500", // green
			b: "#FF2121", // 
			c: "#4d2f5d", // 
			d: "#333333", // 
			e: "#000000", // black
			f: "#fFcC00", // 
			g: "#3FBFFF", // blue
			h: "#ffffff", // white
			i: "#FE782F", // 
			j: "#00cC66", // 
			k: "#99cCfF", // 
			l: "#aA00fF", // 
			m: "#2D7E52", // 
			n: "#9999FF", // 
			p: "#F0D0B0" // peach
		}
		, name: "BurgerTime by EnderAndrew"
		, theme: "city"
		, bricks: [
            "",""
			,"   hHhHhHhHhH        iIi      "
            ,"   hHhbhHbhHh       ibBbi     "
            ,"    hHbBbBhH       ibBbBbi    "
            ,"    hHbhHbhH       bBbBbBi    "
            ,"    hHhHhHhH       bBbBbBbi   "
            ,"pP  hpPpPpPh        bBbBbBi   "
            ,"pP  pPgpPgpP        bBbBbBi   "
            ,"pPh pPpPpPpP        bBbBbBi   "
            ," hHhHpPpPpPhHh      bBbBbIi   "
            ,"  hHhHihHihHhHh    ibBbBbBi   "
            ,"   hHhHhHhHh hHh   ibBbBIi    "
            ,"   hHhihHihHh hH   ibBbIbi    "
            ,"   hHhHhHhHhH pP    ibBbi     "
            ,"     fF  fFj         iIi      "
            ,"     fF   jJ                  "
            ,"    jJj                       "
		]
	},

	{
		colors: {
			a: '#E3C697', // tan
			b: '#000000', // black
			c: '#FFFFFF', // white
			d: '#416999', // blue
			e: '#BE2F37', // red
			f: '#FEC23C', // orange
		}
		, name: "Dig Dug by EnderAndrew"
		, theme: "synthwave"
		, bricks: [
			""
			, "aAaAaAaAaAaAaAaAaAaAaAaAaAaAaA"
			, "aAaAaAaAaAaAaAaAaAaAaAaAaAaAaA"
			, "aAbBbBbBbaAaAaAaAaAaAabBbBbBaA"
			, "bBbBcCcbBbaAaAaAaAaAbBbeEeEbBa"
			, "bBcCcCcCbBbaAaAaAaAabBfcbfeEbB"
			, "bcCcCcCcCcbaAaAaAaAbBfcCbcfeEb"
			, "cCcCcCcCcCbBaAaAaAabfFbBbcCfeE"
			, "cCcdDdbdbdbBbBbBbBbBefcCcCcCce"
			, "cCcCdDbdbdbBbBbBbBbBeEfcCbBbcf"
			, "bcdDdDdDdbebBbBbBbBbeEefcbcCfF"
			, "bcbBcCcCcbeEbBbfFbBbfeEefFfFfF"
			, "eEedDdeEeEeEefFbBfbfbeEeEefefF"
			, "bcCcdDdcCbeEbBbBbBfbBbeEeEeEef"
			, "bcCcCcCcbBebBbBbBbBbBbBefeEecf"
			, "bcCcbBcCbBbBbBbBbBbBbBbBfbBbcb"
			, "bBcCcbcCcbBbaAaAaAaAabBfFfbBbc"
			, "aAaAaAaAaAaAaAaAaAaAaAaAaAaAaA"
		, ]
	},

	{
		colors: {
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
		}
		, name: "Nyan Cat by EnderAndrew"
		, theme: "city"
		, bricks: [
			""
			, "bB       aAaAaAaAaAaAaA      "
			, "bBbBbBbBaiIiIiIiIiIiIiIa     "
			, "cCbBbBbaiIjJjJgjJgjJjiIia    "
			, "cCcCcCcaijJgjJjJaAjJjJjia aA "
			, "daAaAcCaijJjJjJahHajJgjiaAhHa"
			, "ahHhaAaAijJjJjJahHhajJjiahHha"
			, "aAhHhHhaijJjgjJahHhHaAaihHhHa"
			, "eEaAaAhaijJjJjJahHhHhHhHhHhHa"
			, "fFfFfaAaijJjJgahHhkahHhHhkahHa"
			, "fFfFfFfaijgjJjahHhaAhHhahaAhHa"
			, "gGfFfFfaijJjgjahjJhHhHhHhHhjJa"
			, "gGgGgGaAiIjgjJahjJhahHahHahjJa"
			, "  gGaAaAiIijJjJahHhaAaAaAahHa"
			, "   ahHhaAiIiIiIiahHhHhHhHhHa "
			, "   ahHa aAaAaAaAaAaAaAaAaAa  "
			, "   aAa   ahHa   ahHa ahHa    "
			, "          aAa    aAa  aAa    "
		, ]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Portal by Adam"
		, theme: "space"
		, bricks: [
			" fF                        kK "
			, " fF                        kK "
			, " fF                        kK "
			, " fF   hH                   kK "
			, " fF  hHhH                  kK "
			, " fF  hHhH                  kK "
			, " fFh  hH                   kK "
			, " fFhHh                     kK "
			, " fFhHhH                hH hkK "
			, " fFhHhHhH             hHhHhkK "
			, " fFhHh hHh           hHh hHkK "
			, " fFhH   hHh         hHh  hHkK "
			, " fFhH    hH          h   hHkK "
			, " fFh                     hHkK "
			, " fFhH               h   hHhkK "
			, " fF hH             hHh hHhHkK "
			, " fF  hH             hHhHh hkK "
			, " fF hH               hHh   kK "
			, " fFhH                 h    kK "
			, " fF                        kK "
		, ]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Nintendo 64 by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			"            kKkKk             "
			, "         nNcknNnkcnN          "
			, "        kKkKkKkKkKkKk         "
			, "       kncnkKkKkKknfnk        "
			, "       kcCckKkKkKkfnfk        "
			, "       kncnkKkbkKjnfnk        "
			, "       nkKkKkKkKkKgkKn        "
			, "       knkKkKcCckKkKnk        "
			, "       kKnNnkcncknNnkK        "
			, "       kKk  ncCcn  kKk        "
			, "       kKk  nkKkn  kKk        "
			, "       nkn   kKk   nkn        "
			, "        n    kKk    n         "
			, "             nknh             "
			, "              n h             "
			, "                hHh           "
			, "                  h           "
			, "                  hH          "
			, "                   hH         "
			, "                    hH        "
			, "                     h        "
		, ]
	},

	{
		colors: Breakout.Colors.hf
		, name: "GameCube by EnderAndrew"
		, theme: "synthwave"
		, bricks: [
			"           gGgGgGg            "
			, "       gGgGgkKkKkgGgGg        "
			, "      gkKkgGgGgGgGghHkg       "
			, "     gk h kgGghgGgkKjJhg      "
			, "     gkhHhkgGgGgGgbkaAhg      "
			, "     gk h kKg   gkKkKkKg      "
			, "     gGkKkKhkg gfofkKkgG      "
			, "     gGgGkhHhg goOokgGgG      "
			, "     gGg gkhkg gfofg gGg      "
			, "     gGg  gGg   gGG  gGg      "
			, "     gGg        h    gGg      "
			, "      g         hH    g       "
			, "                 hH           "
			, "                  hH          "
			, "                   hH         "
			, "                    h         "
			, "                    hH        "
			, "                     h        "
			, "                     h        "
			, "                     hH       "
			, "                      h       "
			, "                      h       "
		, ]
	},

	{
		colors: Breakout.Colors.hf
		, name: "AOL by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			"                              "
			, "                              "
			, "       gGg                    "
			, "      gfFfg                   "
			, "      gfFfg                   "
			, "      gfFfg                   "
			, "      gGgGg                   "
			, "     gfFfFgGg                 "
			, "     gfFfFfFg  gG   gG  g     "
			, "    gfFfgfFfg g  g g  g g     "
			, "    gfFfFgGg  g  g g  g g     "
			, "   gfFfFfFg   g  g g  g g     "
			, "  gfFfgGfFg   gGgG g  g g     "
			, "  gfFg  gfFg  g  g g  g g     "
			, "   gG    gG   g  g  gG  gGgG  "
		, ]
	},

	{
		colors: {
			w: '#F2F2F2', // White/Bone
			g: '#BDC3C7', // Grey/Shadow
			k: '#000000' // Black holes
		}
		, name: "Bad to the Bone"
		, theme: "synthwave"
		, bricks: [
			"                              "
			, "     wwwww          wwwww     "
			, "   wwwwwwwww      wwwwwwwww   "
			, "  wwwwwwwwwww    wwwwwwwwwww  "
			, " wwwwwwwwwwwww  wwwwwwwwwwwww "
			, " wwkkwwwwwkkww  wwkkwwwwwkkww "
			, " wwkkwwwwwkkww  wwkkwwwwwkkww "
			, " wwwwwwwwwwwww  wwwwwwwwwwwww "
			, "  wwwwwkwwwww    wwwwwkwwwww  "
			, "  wwwwwkwwwww    wwwwwkwwwww  "
			, "   wwwwwwwww      wwwwwwwww   "
			, "   ggwgwgwgg      ggwgwgwgg   "
			, "   gwgwgwgwg      gwgwgwgwg   "
			, "                               "
		]
	},

	{
		colors: {
			o: '#000000', // Black
			g: '#00008B', // Dark Blue
			f: '#C0C0C0', // Silver
			k: '#ADD8E6', // Light Blue
		}
		, name: "Save Icon by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			"                              "
			, "                              "
			, "      ogGgoOofFfFfFfgGg       "
			, "      ogGgoOofFfFoOfgGg       "
			, "      ogGgoOofFfFoOfgGg       "
			, "      ogGgoOofFfFoOfgGg       "
			, "      ogGgoOofFfFfFfgGg       "
			, "      ogGgGgGgGgGgGgGgG       "
			, "      ogGkKkKkKkKkKkKgG       "
			, "      ogGkKkKkKkKkKkKgG       "
			, "      ogGkKgGgGgGgGkKgG       "
			, "      ogGkKkKkKkKkKkKgG       "
			, "      ogGkKkKkKkKkKkKgG       "
			, "      ogGkKgGgGgGgGkKgG       "
			, "      ogGkKkKkKkKkKkKgG       "
			, "      ogGkKkKkKkKkKkKgG       "
			, "      ogokKkKkKkKkKkKog       "
			, "      ogGkKkKkKkKkKkKgG       "
			, "      ogGkKkKkKkKkKkKgG       "
		]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Frog by Mix3rz"
		, theme: "forest"
		, bricks: [
			"                              "
			, "                              "
			, "                              "
			, "         dDd      dDd         "
			, "        dfFfd    dfFfd        "
			, "       dfdDfFdDdDfFdDfd       "
			, "       dfdDfFaAaAfFdDfd       "
			, "       dfFfFfaAaAfFfFfd       "
			, "        dfFfaAaAaAfFfd        "
			, "       daAaAaAaAaAaAaAd       "
			, "      daAdaAaAaAaAaAdaAd      "
			, "      daAadDdDdDdDdDaAad      "
			, "       daAaAaAaAaAaAaAd       "
			, "        dDdaAaAaAaAdDd        "
			, "         daAaAaAaAaAd         "
			, "       dDaAaAamMaAaAadD       "
			, "      dmdaAaAmMmMaAaAdmd      "
			, "      dmMmdmdmMmMdmdmMmd      "
			, "       dDd d dDdD d dDd       "
			, "                              "
			, "                              "
			, "                              "
		]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Ace of Spades by Mix3rz"
		, theme: "city"
		, bricks: [
			"                              "
			, "  e                           "
			, " e e         dD               "
			, " eEe        dDeE              "
			, " e e       deEeEe             "
			, "           dEeEeE             "
			, "          dEeEeEeE            "
			, "          dEeEeEeE            "
			, "         dEeEeEeEeE           "
			, "         dEeEeEeEeE           "
			, "        dEeEeEeEeEeE          "
			, "        dEeEeEeEeEeE          "
			, "       dEeEeEeEeEeEeE         "
			, "       dEeEeEeEeEeEeE         "
			, "             eE               "
			, "            eEeE              "
			, "           eEeEeE             "
			, "          eEeEeEeE        e e "
			, "          eEeEeEeE        eEe "
			, "                          e e "
			, "                           e  "
			, "                              "
		]
	},

	{
		colors: {
			a: '#7FFD44', // light greEn
			b: '#56B428', // greEn
			c: '#AE7349', // tan
			d: '#7A4E33', // brown
			e: '#5A3724', // dark brown
			f: '#A19B9B', // light grey
			g: '#665C64', // dark grey
		}
		, name: "Minecraft by EnderAndrew"
		, theme: "forest"
		, bricks: [
			""
			, "       aAabBabaAaAaAaba      "
			, "       aAaAaebBbaAabaAa      "
			, "       aeabBebeaAaAebBe      "
			, "       egeEbeEebebedeEd      "
			, "       cdcCecCceEegdced      "
			, "       decCeceEedDedDdc      "
			, "       cedDfdDcCdcCdcdc      "
			, "       cdcCcCdDcCcCdDcC      "
			, "       cdDcdcdcdcCdDded      "
			, "       cCedDeEdDdDdcCdc      "
			, "       cCdcCdcCcCcdcCfd      "
			, "       cdDcCcdcgcCdecde      "
			, "       decdcCcdDdDdDdcC      "
			, "       dcdDedcCdecedcCc      "
			, "       cdecdcdcdDdedDcC      "
			, "       cdcCcdgcCcdDcCde      "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Pyramid"
		, theme: "circuit"
		, bricks: [
			"                              "
			, "               d              "
			, "              d d             "
			, "             r S r            "
			, "            r r r r           "
			, "           r r S r r          "
			, "          r r r r r r         "
			, "         r r S r r S r        "
			, "        r r r r r r r r       "
			, "       r r S r r S r r S      "
			, "      r r r r r r r r r r     "
			, "     r r S r r S r r S r r    "
			, "    r r r r r r r r r r r r   "
			, "   r r S r r S r r S r r S r  "
			, "  r r r r r r r r r r r r r r "
			, "                              "
		, ]
	},

	{
		colors: Breakout.Colors.pastel
		, name: "Six Pack"
		, theme: "circuit"
		, bricks: [
			"", ""
			, "  yyYYyyYYyyYY  YYyyYYyyYYyy  "
			, "  bbBBbbBBbbBB  BBbbBBbbBBbb  "
			, "  ggGGggGGggGG  GGggGGggGGgg  "
			, "  ooOOooOOooOO  OOooOOooOOoo  "
			, "", ""
			, "  yyYYyyYYyyYY  YYyyYYyyYYyy  "
			, "  bbBBbbBBbbBB  BBbbBBbbBBbb  "
			, "  ggGGggGGggGG  GGggGGggGGgg  "
			, "  ooOOooOOooOO  OOooOOooOOoo  "
			, "", ""
			, "  yyYYyyYYyyYY  YYyyYYyyYYyy  "
			, "  bbBBbbBBbbBB  BBbbBBbbBBbb  "
			, "  ggGGggGGggGG  GGggGGggGGgg  "
			, "  ooOOooOOooOO  OOooOOooOOoo  "
		]
	},

	{
		colors: Breakout.Colors.vintage
		, name: "Louvre Inverted Pyramid"
		, theme: "city"
		, bricks: [
			"", "", ""
			, "   AAaaAAaaAAaaAAaaAAaaAAaa   "
			, "    BBbbBBbbBBbbBBbbBBbbBB    "
			, "     CCccCCccCCccCCccCCcc     "
			, "      DDddDDddDDddDDddDD      "
			, "       EEeeEEeeEEeeEEee       "
			, "        FFffFFffFFffFF        "
			, "         GGggGGggGGgg         "
			, "          HHhhHHhhHH          "
			, "           IIiiIIii           "
			, "            JJjjJJ            "
			, "             KKkk             "
			, "              LL              "
		]
	},

	{
		colors: Breakout.Colors.vintage
		, name: "Love Triangles"
		, theme: "forest"
		, bricks: [
			"", ""
			, "  aabbccddeeffggFFEEDDCCBBAA  "
			, "   aabbccddeeffFFEEDDCCBBAA   "
			, "    aabbccddeeffEEDDCCBBAA    "
			, "     aabbccddeeEEDDCCBBAA     "
			, "      aabbccddeeDDCCBBAA      "
			, "       aabbccddDDCCBBAA       "
			, "        aabbccddCCBBAA        "
			, "         aabbccCCBBAA         "
			, "          aabbccBBAA          "
			, "      hh   aabbBBAA   hh      "
			, "     hhHH   aabbAA   hhHH     "
			, "    hhiiHH   aaAA   hhiiHH    "
			, "   hhiiIIHH   aa   hhiiIIHH   "
			, "  hhiijjIIHH      hhiijjIIHH  "
			, " hhiijjJJIIHH    hhiijjJJIIHH "
		]
	},

	{
		colors: Breakout.Colors.pastel
		, name: "You've Got Mail"
		, theme: "circuit"
		, bricks: [
			"                              "
			, "                              "
			, "  bbBBbbBBbbBBbbBBbbBBbbBBbb  "
			, "  ooyyYYyyYYyyYYyyYYyyYYyyoo  "
			, "  ooyyYYyyYYyyYYyyYYyyYYyyoo  "
			, "  ooOOYYyyYYyyYYyyYYyyYYOOoo  "
			, "  ooOOooyyYYyyYYyyYYyyooOOoo  "
			, "  oobbooOOYYyyYYyyYYOOoobboo  "
			, "  oobbBBOOooyyYYyyooOOBBbboo  "
			, "  ooppBBbbOOooYYooOObbBBppoo  "
			, "  ooppPPbbBBooOOooBBbbPPppoo  "
			, "  ooppPPppBBbbOObbBBppPPppoo  "
			, "  ooppPPppPPbbBBbbPPppPPppoo  "
			, "  ooppPPppPPppBBppPPppPPppoo  "
			, "  ooppPPppPPppPPppPPppPPppoo  "
			, "  ooggGGggGGggGGggGGggGGggoo  "
			, "  ooggGGggGGggGGggGGggGGggoo  "
			, "  bbBBbbBBbbBBbbBBbbBBbbBBbb  "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Crossfire"
		, theme: "space"
		, bricks: [
			" S S S r r r r r r r r r S S S S"
			, "r S S S r r r r r r r r S S S S "
			, " S r S S r r r r r r r S S S S S"
			, "S S S r S r r r r r r S S S S S "
			, " S S S S r r r r r r S S S S S  "
			, "  S S S S r r r r r S S S S S   "
			, "   S S S S r r r r S S S S S    "
			, "    S S S S r r r S S S S S     "
			, "     S S S S r r S S S S S      "
			, "      S S S S r S S S S S       "
			, "       r r r r S r r r r        "
			, "        S S S S r S S S         "
			, "                           "
		, ]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Chevron"
		, theme: "city"
		, bricks: [
			"                              "
			, "i     i     i     i     i     "
			, " j   j j   j j   j j   j j   j"
			, "  k k   k k   k k   k k   k k "
			, "   l     l     l     l     l  "
			, "    m   m m   m m   m m   m   "
			, "     n n   n n   n n   n n    "
			, "      f     f     f     f     "
			, "     n n   n n   n n   n n    "
			, "    m   m m   m m   m m   m   "
			, "   l     l     l     l     l  "
			, "  k k   k k   k k   k k   k k "
			, " j   j j   j j   j j   j j   j"
			, "i     i     i     i     i     "
			, "                              "
		]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Pillars"
		, theme: "forest"
		, bricks: [
			"                              "
			, " i  i  i  i  i  i  i  i  i  i "
			, " j  j  j  j  j  j  j  j  j  j "
			, " k  k  k  k  k  k  k  k  k  k "
			, " l  l  l  l  l  l  l  l  l  l "
			, " m  m  m  m  m  m  m  m  m  m "
			, " m  m  m  m  m  m  m  m  m  m "
			, " l  l  l  l  l  l  l  l  l  l "
			, " k  k  k  k  k  k  k  k  k  k "
			, " j  j  j  j  j  j  j  j  j  j "
			, " i  i  i  i  i  i  i  i  i  i "
			, "                              "
		]
	},

	{
		colors: Breakout.Colors.hf
		, name: "T-Rings"
		, theme: "city"
		, bricks: [
			"n n n n n n n n n n n n n n n"
			, " k                          k"
			, "  i                        i "
			, "   j                      j  "
			, "    l                    l   "
			, "     m m m m m m m m m m m  "
			, "    l                    l   "
			, "   j                      j  "
			, "  i                        i "
			, " k                          k"
			, "n n n n n n n n n n n n n n n"
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "The Wall"
		, theme: "circuit"
		, bricks: [
			"r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r "
			, "o o o o o o o o o o o o o o o o o o o o o o o o o o o o o o "
			, "l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r "
			, "o o o o o o o o o o o o o o o o o o o o o o o o o o o o o o "
			, "l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r "
			, "o o o o o o o o o o o o o o o o o o o o o o o o o o o o o o "
			, "l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l "
			, "                              "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Checkerboard"
		, theme: "city"
		, bricks: [
			"                              "
			, "o S o S o S o S o S o S o S o S o S o S o S o S o S o S o S "
			, "S r S r S r S r S r S r S r S r S r S r S r S r S r S r S r "
			, "o S o S o S o S o S o S o S o S o S o S o S o S o S o S o S "
			, "S l S l S l S l S l S l S l S l S l S l S l S l S l S l S l "
			, "o S o S o S o S o S o S o S o S o S o S o S o S o S o S o S "
			, "S r S r S r S r S r S r S r S r S r S r S r S r S r S r S r "
			, "o S o S o S o S o S o S o S o S o S o S o S o S o S o S o S "
			, "S l S l S l S l S l S l S l S l S l S l S l S l S l S l S l "
			, "o S o S o S o S o S o S o S o S o S o S o S o S o S o S o S "
			, "                              "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Tunnel Vision"
		, theme: "space"
		, bricks: [
			"S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S r r r r r r r r r r r r r r r r r r r r r r r r r r r r S "
			, "S r S S S S S S S S S S S S S S S S S S S S S S S S S S r S "
			, "S r S l l l l l l l l l l l l l l l l l l l l l l l l S r S "
			, "S r S l S S S S S S S S S S S S S S S S S S S S S S S l S r S "
			, "S r S l S o o o o o o o o o o o o o o o o o o o o o S l S r S "
			, "S r S l S o S S S S S S S S S S S S S S S S S S S o S l S r S "
			, "S r S l S o S y y y y y y y y y y y y y y y y y S o S l S r S "
			, "S r S l S o S y S             S y S o S l S r S "
			, "S r S l S o S y S S S S S S S S S S S S S S S y S o S l S r S "
			, "S r S l S o S y y y y y y y y y y y y y y y y y S o S l S r S "
			, "S r S l S o S S S S S S S S S S S S S S S S S S S o S l S r S "
			, "S r S l l l l l l l l l l l l l l l l l l l l l l l l S r S "
			, "S r S S S S S S S S S S S S S S S S S S S S S S S S S S S r S "
			, "S r r r r r r r r r r r r r r r r r r r r r r r r r r r r S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "                              "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "The Box"
		, theme: "forest"
		, bricks: [
			"r S o l l l l l l l l l l l l l l l l l l l l l l l o S r "
			, "r S o l y y y y y y y y y y y y y y y y y y y y y l o S r "
			, "r S o l y g g g g g g g g g g g g g g g g g g y l o S r "
			, "r S o l y g b b b b b b b b b b b b b b b b g y l o S r "
			, "r S o l y g b p p p p p p p p p p p p p p b g y l o S r "
			, "r S o l y g b p w w w w w w w w w w w w p b g y l o S r "
			, "r S o l y g b p w S S S S S S S S S S w p b g y l o S r "
			, "r S o l y g b p w S r r r r r r r r S w p b g y l o S r "
			, "r S o l y g b p w S r l l l l l l r S w p b g y l o S r "
			, "r S o l y g b p w S r l o o o l r S w p b g y l o S r "
			, "r S o l y g b p w S r l l l l l l r S w p b g y l o S r "
			, "r S o l y g b p w S r r r r r r r r S w p b g y l o S r "
			, "r S o l y g b p w S S S S S S S S S S w p b g y l o S r "
			, "r S o l y g b p w w w w w w w w w w w w p b g y l o S r "
			, "r S o l y g b b b b b b b b b b b b b b b b g y l o S r "
			, "r S o l y g g g g g g g g g g g g g g g g g g y l o S r "
			, "r S o l y y y y y y y y y y y y y y y y y y y y y l o S r "
			, "r S o l l l l l l l l l l l l l l l l l l l l l l l l o S r "
			, "r S o o o o o o o o o o o o o o o o o o o o o o o o o S r "
		, ]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Play a Game"
		, theme: "circuit"
		, bricks: [
			"m l m l m l m l m l m l m l m l"
			, "n k n k n k n k n k n k n k n k"
			, "m l m l m l m l m l m l m l m l"
			, "n k n k n k n k n k n k n k n k"
			, "m l m l m l m l m l m l m l m l"
			, "n k n k n k n k n k n k n k n k"
			, "m l m l m l m l m l m l m l m l"
			, "n k n k n k n k n k n k n k n k"
			, "m l m l m l m l m l m l m l m l"
			, "n k n k n k n k n k n k n k n k"
			, "m l m l m l m l m l m l m l m l"
			, "n k n k n k n k n k n k n k n k"
		, ]
	},


	{
		colors: Breakout.Colors.arkanoid
		, name: "The Grid"
		, theme: "synthwave"
		, bricks: [
			"S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S r o l y g b p S r o l y g b p S r o l y g b p S r o l y S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S o r l y g b p S o r l y g b p S o r l y g b p S o r l y S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S l o r y g b p S l o r y g b p S l o r y g b p S l o r y S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S y g b p r o l S y g b p r o l S y g b p r o l S y g b p S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S g b p r o l y S g b p r o l y S g b p r o l y S g b p r S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S b p r o l y g S b p r o l y g S b p r o l y g S b p r o S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S p r o l y g b S p r o l y g b S p r o l y g b S p r o l S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Wavy Walls"
		, theme: "city"
		, bricks: [
			"G G G G G G G G G G G G G G G "
			, " y y y y y y y y y y y y y y y"
			, "G G G G G G G G G G G G G G G "
			, " y y y y y y y y y y y y y y y"
			, " G G G G G G G G G G G G G G G"
			, "  y y y y y y y y y y y y y y "
			, " G G G G G G G G G G G G G G G"
			, "  y y y y y y y y y y y y y y "
			, " G G G G G G G G G G G G G G G"
			, "                              "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
		]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "The Checker"
		, theme: "space"
		, bricks: [
			"R Y R Y R Y R Y R Y R Y R Y R Y "
			, " Y R Y R Y R Y R Y R Y R Y R Y R"
			, "R Y R Y R Y R Y R Y R Y R Y R Y "
			, " Y R Y R Y R Y R Y R Y R Y R Y R"
			, "R Y R Y R Y R Y R Y R Y R Y R Y "
			, " Y R Y R Y R Y R Y R Y R Y R Y R"
			, "R Y R Y R Y R Y R Y R Y R Y R Y "
			, " Y R Y R Y R Y R Y R Y R Y R Y R"
			, "r y r y r y r y r y r y r y r y "
			, " y r y r y r y r y r y r y r y r"
			, "r y r y r y r y r y r y r y r y "
			, " y r y r y r y r y r y r y r y r"
			, "r y r y r y r y r y r y r y r y "
			, " y r y r y r y r y r y r y r y r"
			, "                              "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
		]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Waterfall"
		, theme: "forest"
		, bricks: [
			"S r r r r S r r r r S r r r r S r r r r S "
			, " l l l l   l l l l   l l l l   l l l l    "
			, "  o o o o S o o o o S o o o o S o o o o S "
			, "   w w w   w w w   w w w   w w w          "
			, "S r r r r S r r r r S r r r r S r r r r S "
			, " l l l l   l l l l   l l l l   l l l l    "
			, "  o o o o S o o o o S o o o o S o o o o S "
			, "   w w w   w w w   w w w   w w w          "
			, "S r r r r S r r r r S r r r r S r r r r S "
			, " l l l l   l l l l   l l l l   l l l l    "
			, "                              "
		, ]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Test"
		, theme: "space"
		, bricks: [
			"fffffFFFFFfffffFFFFFfffffFFFFf"
			, "ggGggGGGGGgggggGGGGGgggggGGGGG"
			, "hhhhhHHHHHhhhhhHHHHHhhhhhHHHHH"
			, "iiiiiIIIIIiiiiiIIIIIiiiiiIIIII"
			, "jjjjjJJJJJjjjjjJJJJJjjjjjJJJJJ"
			, "kkkkkKKKKKkkkkkKKKKKkkkkkKKKKK"
			, "lllllLLLLLlllllLLLLLlllllLLLLL"
			, "mmmmmMMMMMmmmmmMMMMMmmmmmMMMMM"
			, "nnnnnNNNNNnnnnnNNNNNnnnnnNNNNN"
			, "iiiiiIIIIIiiiiiIIIIIiiiiiIIIII"
			, "jjjjjJJJJJjjjjjJJJJJjjjjjJJJJJ"
			, "kkkkkKKKKKkkkkkKKKKKkkkkkKKKKK"
			, "lllllLLLLLlllllLLLLLlllllLLLLL"
			, "mmmmmMMMMMmmmmmMMMMMmmmmmMMMMM"
			, "nnnnnNNNNNnnnnnNNNNNnnnnnNNNNN"
			, "iiiiiIIIIIiiiiiIIIIIiiiiiIIIII"
			, "jjjjjJJJJJjjjjjJJJJJjjjjjJJJJJ"
			, "kkkkkKKKKKkkkkkKKKKKkkkkkKKKKK"
			, "lllllLLLLLlllllLLLLLlllllLLLLL"
			, "mmmmmMMMMMmmmmmMMMMMmmmmmMMMMM"
			, "nnnnnNNNNNnnnnnNNNNNnnnnnNNNNN"
		]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Test2"
		, theme: "city"
		, bricks: [
			"                              "
			, "       eE eEeEeEeEeEeEeE      "
			, "      eEeEeEe           e     "
			, "    eEe                 eE    "
			, "   eE                    e    "
			, "   e       gG     gG     eE   "
			, "   e       gG     gG      e   "
			, "  eE                      e   "
			, "  e                       e   "
			, "   e                  i   eE  "
			, "   e                  i    e  "
			, "   e                  i    e  "
			, "   e   iIi          iIi    e  "
			, "   eE    iIiIiIiIiIi      eE  "
			, "    eE                    e   "
			, "     eE                   e   "
			, "      eE                 eE   "
			, "        eE              eE    "
			, "         eEeE        eEeE     "
			, "             eEeEeEeEe        "
		, ]
	},

];