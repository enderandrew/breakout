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
		, name: "Catch 'em All by EnderAndrew"
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
			b: '#A1DBE9', // Blue
			g: '#399F53', // Green
			l: '#B4E52A', // Light Green
			w: '#FFFFFF', // White
			k: '#000000', // Black
			r: '#F2192A', // Red
		}
		, name: "Bulbasaur by EnderAndrew"
		, theme: "forest"
		, bricks: [
			  "                 kKk     "
			, "                klLlk    "
			, "              kKklLlk    "
			, "            kKlklklklkK  "
			, "        k  klLklLklklLlk "
			, "       kbkKkgkglLklLklLlk"
			, "       kbBbBkKgGklLlLklgk"
			, "       kbBbBbBkgkglLgklgk"
			, "      kbBbBbBbBkKkgGgkGk "
			, "     kKbBbBbBbBbBkgGkKkbk"
			, "     kKbBbBbBbBbkbkKkbBbk"
			, "     kbBbBbBkKbBbBbBbkbwk"
			, "     kbBbBbkrwwbwkbkbkkk "
			, "      kbBbBkrwbBkbBbk    "
			, "       kKbBbBbBkbBbBk    "
			, "         kKkKkKkKwbwk    "
			, "                 kKk     "
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
			g: '#7FE97B', // Green
			b: '#D8F5FD', // Blue
			n: '#3C9D30', // Brown
			k: '#000000', // black
			w: '#FFFFFF', // white
			l: '#2FF924', // lightsaber
		}
		, name: "Yoda by EnderAndrew"
		, theme: "space"
		, bricks: [
			  "",""
			, "              kKkK       "
			, "            kKgGgGkKk    "
			, "        kKkKbgGgGgGbBkKkK"
			, "        kgGgGgGgGgGbgGgGk"
			, "      l  kgGgkgGgkgGgGgk "
			, "       l  kgGkgGgkgGgkK  "
			, "        l  kgGwWwgGgk    "
			, "         l  kgGgGgGk     "
			, "          l  kwkKkKwk    "
			, "           lkKwWnwnwWwk  "
			, "          kgwkwnNnwWkwk  "
			, "          kKkKwkKkwWkgk  "
			, "             kwnNnwWkK   "
			, "             kgGkKgGk    "
			, "             kKk  kKk    "
		, ]
	},

	{
		colors: {
			o: '#F47D39', // Orange
			r: '#D9242B', // Red
			y: '#F4EC1D', // Yellow
			w: '#FFFFFF', // White
			k: '#000000', // Black
			t: '#F7DBB4', // Tan
		}
		, name: "Charizard by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			""
			, "         kKkK         k   "
			, "        koOork       krk  "
			, "       koOoOork      krRk "
			, "       koOoOook      krRk "
			, "      koOoOoOork    krRork"
			, "     koOoOwkoOok    kroyrk"
			, "     koOoOkKorRrk   kryYrk"
			, "     koOoOkKorRrk    kykK "
			, "      kroOoOrRrRrk   krk  "
			, "       kKrRrRrRrRrk koOk  "
			, "         kKkrRkrRrkKoOk   "
			, "          ktTkoOrRrkrok   "
			, "          ktTtkKrRrkrk    "
			, "         ktktTtrRrRkK     "
			, "          kKktTrRrkK      "
			, "             kKkrkK       "
			, "              kwrwk       "
			, "               kKk        "
		]
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
		colors: {
			b: '#129DE2', // Blue
			l: '#9EDFE1', // Light Blue
			r: '#82031E', // Red
			w: '#FFFFFF', // White
			k: '#000000', // Black
			t: '#F7DBB4', // Tan
			n: '#BE7564', // Brown
			g: '#BEBDC2', // Grey
		}
		, name: "Squirtle by EnderAndrew"
		, theme: "forest"
		, bricks: [
			  ""
			, "        kKkK         kKk  "
			, "       klLlbkK      klLlk "
			, "      klLlLlLbkK   kKlLbBk"
			, "      klLlLlLlkrkK klLbBbk"
			, "     krlLlLlLlbnNrkblbkBbk"
			, "     klLlLwklLbtTnrkbBkbk "
			, "     kblLlkrlbBtTtnkbkKk  "
			, "      kbBlkrbBbktTnrkK    "
			, "       kKbBbBkKlLtnrk     "
			, "       kbkKkKlLlbtnrk     "
			, "        kKtTklLbktnrk     "
			, "          ktTkKkKgnrk     "
			, "         klktTtTtkgk      "
			, "         kKkKktTlkgk      "
			, "             kKklbk       "
			, "              kbBbk       "
			, "               kKk        "

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
			b: '#003A90', // Blue
			l: '#A6C5D9', // Light Blue
			k: '#000000', // Black
			w: '#FFFFFF', // White
			y: '#F5FE91', // Yellow
			o: '#FDB26F', // Orange
			r: '#E55C66', // Red
			g: '#217F4B', // Green
		}
		, name: "Droid Buddies by EnderAndrew"
		, theme: "space"
		, bricks: [
			  "      kKkK            yY      "
			, "     klbwlk          yYyY     "
			, "    kblbBlbk        yoOoOy    "
			, "   kblLlLlLbk      yoOoOoOy   "
			, "   klbBblLlLk     yoOoOoOoOy  "
			, "   klbrbBblLk     yoyYoOyYoY  "
			, "   kKkKkKkKkK     yoyYoOyYoY  "
			, "  kKwWwWwWwWkK    yOoOoOoOoy  "
			, " kwklwbBbBwlkwk    yOokKoOy   "
			, " kwklwWwWwWlkwk   yYyOoOoyYy  "
			, " kwklwbBbBwlkwk  yoOoyYyYoOoy "
			, " kwklwWwWwWlkwk yYyYoOoOoOyYyY"
			, " kwklwWbBwWlkwk yoOyoOyYoOyoOy"
			, " kwklwWwWwWlkwk yoOyoOyYoOyoOy"
			, " kwkwWbwWbwWkwk  yYykbrlgryYy "
			, " kKkwWblLbwWkKk    yOoyYoOy   "
			, "kKwkKkKkKkKkKwkK   yoOyYoOy   "
			, "kwWk  kwWk  kwWk   yoOyYoOy   "
			, "kKkK kKkKkK kKkK   yYy  yYy   "
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
		colors: Breakout.Colors.arkanoid
		, name: "Atari by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			  "     o  oOoOo  oO   oOoO  o"
			, "    lLl   l   lLl   l  lL l"
			, "    g g   g   gGg   g   g g"
			, "    r r   r   r rR  r   r r"
			, "   bB bB  b   b bB  b bBb b"
			, "   pP pP  p  pP  p  p pP  p"
			, "   yYyYy  y  yYyYy  y yY  y"
			, "  sS   sS s  s   sS s  sS s"
			, "  dD   dD d dD    d d   d d"
			, ""
			, "              w      "
			, "             oOo     "
			, "             lLl     "
			, "            g g g    "
			, "            r r r    "
			, "            b b b    "
			, "           pP p pP   "
			, "          yY  y  yY  "
			, "         sS   S   sS "
			, "        dD    d    dD"
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
			t: '#F5BB9F', // tan
			b: '#B1510D', // brown
			w: '#FEFCFF', // white
			k: '#000000', // black
		}
		, name: "Donkey King Jr. by EnderAndrew"
		, theme: "city"
		, bricks: [
			  "            bBbBb          "
			, "           BbtTtBb         "
			, "         btbtwWwtbtb       "
			, "        wbtTwkwkwtTbw      "
			, "       bwbBtTbBbtTbBwb     "
			, "      bBwtTbtTbtTbtTwbB    "
			, "     bBbwtbtTtbtTtbtwbBb   "
			, "    bBbBwtTbBbBbBbtTwbBbB  "
			, "    bBbBbwtTtTtTtTtwbBbBb  "
			, "   bBbBbBbwWbBbBbwWbBbBbBb "
			, "   bBbB bwWwWwWwWwWwb bBbB "
			, "   bBb  wWwWwbBbBwWwW  bBb "
			, "  tbtT   wWwWwWbwWwW   tTbt"
			, "  tTtTt bBbwWbBwWwbBb tTtTt"
			, "   tTt   bBbwWwWwbBb   tTt "
			, "    tT bBbBbB    bBbBb tT  "
		, ]
	},
	
	{
		colors: {
			k: '#202020', // black
			b: '#2040D0', // blue
			l: '#5080F0', // light blue
			c: '#30C0D0', // cyan
			d: '#1090A0', // dark cyan
			r: '#A02010', // red
			p: '#F0B080', // peach
			t: '#D07040', // tan
			n: '#804020', // brown
			i: '#203060', // indigo
			g: '#404040', // grey
			w: '#FFFFFF', // white
		}
		, name: "Mega Man by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			  "               kKk            "
			, "             diIidcdi         "
			, "             blLliIib         "
			, "            ibBlLidciI        "
			, "            kKbiIidDiI        "
			, "      kKkKk kdtpwkikwi        "
			, "   kiblbBcCdrdppwWiwik        "
			, "  klLlblidcCkKtpnPpPn  ibBbik "
			, "  klLbliIidcibitpnNp  ibBliIl "
			, "   kbik   kdcCiIiIiIdDbBbiIlrR"
			, "         kKkcCcCckKkKkiIiIir  "
			, "  kiIi   bBbidDd       kKkK   "
			, "  ibBbk kbBikKkKk             "
			, " ibBbBidkikcCckilbkKkKkK      "
			, "kbBibBbidkKkKkiblLiblLkK      "
			, "kbBiIbBikK    kilLblLgkK      "
			, "kbBiIikKk     kKbBlLbrk       "
			, "kbBkK          kiblbrk        "
			, " bB             biIbg         "
			, "                 kKk          "
		, ]
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
		colors: {
			k: '#000000', // Black
			y: '#DDD33D', // Yellow
		}
		, name: "The Dark Knight by EnderAndrew"
		, theme: "city"
		, bricks: [
			"", "", ""
			, "  yYyYyYyYy       yYyYyYyYy "
			, " ykKkKkKkKky y y ykKkKkKkKky"
			, "  ykKkKkKkKyYkykyYkKkKkKkKy "
			, "   yKkKkKkKkyKkKykKkKkKkKy  "
			, "   yKkKkKkKkKkKkKkKkKkKkKy  "
			, "    yKkKkKKkKkKkKkKkKkKky   "
			, "    yYyKkKKkKkKkKkKkKkyYy   "
			, "       yYkKkKkKkKkKkyY      "
			, "         yYkKkKkKkyY        " 
			, "           yKkKkKy          "
			, "            yKkKy           "
			, "             yKy            "
			, "              y"
		]
	},
	
	{
		colors: {
			b: '#0B5FB9', // Blue
			r: '#B11930', // Red
			y: '#DDD33D', // Yellow
		}
		, name: "Kindness is Punk Rock by EnderAndrew"
		, theme: "synthwave"
		, bricks: [
			""
			, "        bBbBbBbBbBbBb     "
			, "       bBbBbBbBbBbBbBb    "
			, "      bBrRrRrRrRrRrRrbB   "
			, "     bBrRyrRyYyYrRyrRrbB  "
			, "    bBrRyrRyYyYyYrRryrRbB "
			, "   bbrRyYrRyYyYyYyYyYyrRbB"
			, "    bBrRyrRrRrRrRrRyYrRbB "
			, "     bBrRrRrRrRrRrRrRrbB  "
			, "      bBrRyYyYyYyrRrRbB   " 
			, "       bBrRyrRyYyrRrbB    "
			, "        bBrRrRrRrRrbB     "
			, "         bBrRyYyrRbB      "
			, "          bBrRyrRbB       "
			, "           bBrRrbB        "
			, "            bBrbB         "
			, "             bBb          "
			, "              B           "
		]
	},

	{
		colors: {
			l: '#7D888A', // light grek
			d: '#343837', // dark grek
			n: '#463233', // brown
			g: '#459A5F', // green
			y: '#F7F2AE', // yellow
			s: '#A5AAAD', // slate grey
			t: '#BD9C8B', // tan
			r: '#8A2837', // red
			b: '#10145D', // blue
			k: '#000000', // black

		}
		, name: "Vader and Boba Fett by EnderAndrew"
		, theme: "space"
		, bricks: [
			  "      lLlL           nNnN     "
			, "     lkKkKl         ngGgGn    "
			, "    lkKkKkKl       ngGgGgGn   "
			, "    lkKkKkKl      ngGgGgGgGn  "
			, "   lklLkKlLkl     nrRrRrRrRn  "
			, "   lklkKkKlkl     nrkKkKkKrn  "
			, "   lkKklLkKkl     ngrRkKrRgn  "
			, "  lkKklKklKkKl    ngGrkKrgGn  "
			, "   lLlkKkKlLl    nyngrkKrgnyn "
			, "  lkKlLlLlLkKl  nyYsnNnNnNsyYn"
			, " lkKkKkKkKkKkKl nsSnsgGgGsnSsn"
			, " lkKkKkdbkKlkKl ngGnsSgGsSngGn"
			, " lkKkKkdrkKlkKl  nNntTtTtTnNn "
			, "lklLldDdDdDlLlkl   nsSgGsSn   "
			, "lkKklkKklkKlkKkl   nyYynyYn   "
			, "lkKklkKklkKlkKkl   nsSsnsSn   "
			, "lklLlkKklkKlLlkl   nsSsnsSn   "
			, " l   lLl lL   l     nNn nN    "
		]
	},

	{
		colors: {
			g: '#FFD700', // bright gold
			G: '#B8860B', // dark goldenrod
		}
		, name: "Triforce by EnderAndrew"
		, theme: "forest"
		, bricks: [
			  "                       "
			, "              g        "
			, "             gGg       "
			, "            gGgGg      "
			, "           gGgGgGg     "
			, "          GgGgGgGgG    "
			, "          G       G    "
			, "         gGg     gGg   "
			, "        gGgGg   gGgGg  "
			, "       gGgGgGg gGgGgGg "
			, "      GgGgGgGgGgGgGgGgG"
		]
	},

	{
		colors: {
			r: '#EC1D25', // red
			b: '#0652A0', // blue
			y: '#FFF100', // yellow
			g: '#059244', // green
			o: '#FA6620', // orange
			l: '#AEAADD', // lavender
			p: '#F13BF0', // purple
			n: '#663B2A', // brown
			w: '#FFFFFF', // white
			k: '#000000', // black
		}
		, name: "Heroes by EnderAndrew"
		, theme: "city"
		, bricks: [
			  "  rRrRrR   kKkKkKk  k      k"
			, " krRrRrRk kKgGgGgkK kK    kK"
			, " kKrRrRkK kgKkgKkgK kKkKkKkK"
			, " kwkrRkwk gGwkgkwgG kwWkKwWk"
			, " kwWkKwWk gGgGgGgGg kKkKkKkK"
			, " rkKrRkKr  gGgGgGg  kKkKkKkK"
			, "  rRrRrR   gGkKkgG   kyYyYk "
			, "  rRrRrR    gGgGg    kyoOyk "
			, "    rR       gGg       kK   "
			, ""
			, "    rRrRr   w bBb w l      l"
            , "   rYyryYr  bBbwbBb lL lL lL"
			, "  ryYyYyYyr bBwbwbB lLlLlLlL"
			, "  rywWywWyr bBbBbBb kwWlLwWk"
			, "  ryYyYyYyr bwWbwWb lkKlLkKl"
			, "   ryyYyYr  bBbybBb lLlLlLlL"
			, "   rykKkyr  byYyYyb  wWwWwW "
			, "    ryYyr    yYnyY    wpPw  "
			, "     rRr      yYy      wW   "
		]
	},
	
	{
		colors: {
			c: '#58C8AF', // turquoise
			y: '#F6D814', // yellow
			o: '#F4BB24', // orange
			b: '#E9E98F', // blonde
			g: '#57A13E', // green
			t: '#95603E', // tan
			l: '#EECFEF', // lavender
			p: '#F0CCB2', // peach
			r: '#A68EDA', // purple
			n: '#56352E', // brown
			w: '#FFFFFF', // white
			k: '#000000', // black

		}
		, name: "Princesses by EnderAndrew"
		, theme: "forest"
		, bricks: [
              "         yYy         nNn    "
            , "       yYbyby        YyY    "
			, "      yYpypypy      nNnNn   "
			, "      yypPpPpyY    nNpPpnN  "
			, "     ybpcpPpcpy   nNpPpPpnN "
			, "     typPpPpPpy   nptpPptpn "
			, "     ybypPpPpby  nNpPpPpPpn "
			, "     bybrpPpry   nNnpPpPpn  "
			, "    ycyplwpwlr   nNnNpPpn   "
			, "    bybprlwlrp    nNyoOoy   "
			, "    ybyprRlrRp     npyoyp   "
			, "    bygrRrlrRr      pyYyp   "
			, "   yYbyrRrlrRr      yYyYy   "
            , "  bpy rRrlrlrRr    yYyYyYy  "
			, "  yb  rRrlrlrRr   oOoOoOoOo "
			, "   yYrRrlrRrlrRr yYyYyYyYyYy"
		]
	},
	
	{
		colors: {
			r: '#D50019', // red
			y: '#F8E819', // yellow
            p: '#F6D814', // peach
			w: '#FFFFFF', // white
			k: '#000000', // black

		}
		, name: "Minnie and Mickey by EnderAndrew"
		, theme: "synthwave"
		, bricks: [
            "",""
            , "    kKr   rkK    kKk   kKk "
			, "   kKrRr rRrkK  kKkKk kKkKk"
			, "   kKrRryrRrkK  kKkKk kKkKk"
			, "   kKkrpkprkKk   kKkpkpkKk "
			, "    kKpPpPpkK     kpPpPpk  "
			, "     kpkpkpk      kpkpkpk  "
			, "     kpkpkpk      kpkpkpk  "
			, "     pPpkpPp      pPpkpPp  "
			, "      pPpPp        pPpPp   "
			, "      rkKkr        krkrk   "
			, "    wrRwrwrRw    wkKrkrkKw "
			, "     wrRwrRw      wrwrwrw  "
			, "     rwrRrwr       rRrRr   "
            , "      kK kK        kK kK   "
			, "     yYy yYy      yYy yYy  "
		]
	},

	{
		colors: {
			b: '#2E76C8', // blue
			c: '#7FA2D8', // cyan
			y: '#E2B734', // yellow
			g: '#79E252', // green
			t: '#9C553F', // tan
			l: '#AEAADD', // lavender
			p: '#F0BA96', // peach
			i: '#CD6389', // pink
			n: '#422D32', // brown
			w: '#FFFFFF', // white
			k: '#000000', // black
			z: '#BEC9E5', // clear
		}
		, name: "Got a Friend in You by EnderAndrew"
		, theme: "city"
		, bricks: [
			  ""
			, "      tTtTtTt     zZzZz   "
			, "      tTtTtTt    zcCcCcz  "
			, "    tTtTtTtTtTt zcpPpPpcz "
			, "      npPpPpn   zcpkpkpcz "
			, "      npkpkpn   zcpPpPpcz "
			, "      pPpPpPp   zcpPpPpcz "
			, "       pPpPp   wgwgGgGgwgw"
			, "     pykyYykyp wgwgngibwgw"
			, "     pywkykwyp   wWwWwWw  "
			, "       nNnNn     gkKkKkg  "
            , "       bBbBbn    wWwWwWw  "
			, "       bB bB     wWwWwWw  "
			, "       nN nN     gGg gGg  "
		]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Ace of Spades by Mix3rz"
		, theme: "circuit"
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
		colors: {
			g: "#00B500", // Invader Green
			w: "#FCFCFC", // Eye White
		}
		, name: "Invading Your Space by EnderAndrew"
		, theme: "space"
		, bricks: [
			""
			, ""
			, "    g     G   "
			, "     g   G        g     G   "
			, "    gGgGgGg        g   G    "
			, "   gG wWw Gg      gGgGgGg   "
			, "  gGgGgGgGgGg    gG wWw Gg  "
			, "  g gGgGgGg G   gGgGgGgGgGg "
			, "  g g     G G   g gGgGgGg G "
			, "     gG   Gg    g g     G G "
			, "                   gG   Gg  "
            , "           g     G            "
			, "            g   G             "
			, "           gGgGgGg            "
			, "          gG wWw Gg           "
			, "         gGgGgGgGgGg          "
			, "         g gGgGgGg G          "
			, "         g g     G G          "
			, "            gG   Gg           "
		]
	},

	{
		colors: {
			r: '#FF0000', // ghost red
			w: '#FFFFFF', // eye whites
			k: '#1A1AEE', // blue-black pupils
			p: '#FFB8FF', // ghost pink
		}
		, name: "Blinky and Pinky by EnderAndrew"
		, theme: "synthwave"
		, bricks: [
			"                              "
			, "      RrRr            PpPp      "
			, "    RrRrRrRr        PpPpPpPp    "
			, "   rRrRrRrRrR      pPpPpPpPpP   "
			, "  RrRwWrRrRwWr    PpPpPpPpPpPp  "
			, "  RrWwWwRrWwWw    PpWwPpPpWwPp` "
			, "  RrWwkKRrWwkK    PwWwWpPwWwWP  "
			, " rRrWwkKRrWwkKR  pPwWwWpPwWwWpP "
			, " rRrRwWrRrRwWrR  pPwkKWpPwkKWpP "
			, " rRrRrRrRrRrRrR  pPpkKPpPpkKPpP "
			, " rRrRrRrRrRrRrR  pPpPpPpPpPpPpP "
			, " rRrRrRrRrRrRrR  pPpPpPpPpPpPpP "
			, " rRrRrRrRrRrRrR  pPpPpPpPpPpPpP "
			, " rR rRr  rRr rR  pPpp pppp pppP "
			, " r   rR  rR   r   pp   pp   pp  "
		]
	},
 
	{
		colors: {
			g: '#1A7A1A', // forest green
			y: '#FFD700', // gold star / ornaments
			r: '#CC1111', // red ornaments
			b: '#0055CC', // blue ornaments
			k: '#5C3317', // brown trunk
		}
		, name: "O Christmas Tree by EnderAndrew"
		, theme: "forest"
		, bricks: [
			  "              y               "
			, "             ggg              "
			, "            ggggg             "
			, "           yggggggy           "
			, "            ggggg             "
			, "           ggggggg            "
			, "          rggggggggr          "
			, "         ggggggggggg          "
			, "           ggggggg            "
			, "          ggggggggg           "
			, "         bgggggggggb          "
			, "        ggggggggggggg         "
			, "       rgggggggggggggr        "
			, "             kkk              "
			, "             kkk              "
		]
	},
  
    {
		colors: {
			e: "#000000", // Dark Outline
			r: "#E52521", // Heart Red
			w: "#FCFCFC", // Glossy Reflection
		}
		, name: "Heart Container"
		, theme: "forest"
		, bricks: [
			""
			, "     eEeEeE      eEeEeE      "
			, "   eErRrRrReE  eErRrRrReE    "
			, " eErRwWwWwRrReErRrRrRrRrRrReE"
			, " eErRwWwWwRrRrRrRrRrRrRrRrReE"
			, " eErRrRrRrRrRrRrRrRrRrRrRrReE"
			, "   eErRrRrRrRrRrRrRrRrRrReE  "
			, "     eErRrRrRrRrRrRrRrReE    "
			, "       eErRrRrRrRrRrReE      "
			, "         eErRrRrRrReE        "
			, "           eErRrReE          "
			, "            erRre            "
			, "             ErE             "
			, "              e              "
		]
	},

	{
		colors: {
			t: '#C9A96E', // caramel planet body
			d: '#7A5C1E', // dark equatorial band
			g: '#DAA520', // gold ring
		}
		, name: "Lord of the Rings"
		, theme: "space"
		, bricks: [
			"                              "
            , "              tT              "
			, "            tTtTtT            "
			, "          tTtTtTtTtT          "
			, "        TtTtTtTtTtTtTt        "
			, "       tTtTtTtTtTtTtTtT       "
			, "      dDdDdDdDdDdDdDdDdD      "
			, "     tTtTtTtTtTtTtTtTtTtT     "
			, "gGgGgGgGgGgGgGgGgGgGgGgGgGgGgG"
			, "gGgGgGgGgGgGgGgGgGgGgGgGgGgGgG"
			, "     tTtTtTtTtTtTtTtTtTtT     "
			, "      dDdDdDdDdDdDdDdDdD      "
			, "       tTtTtTtTtTtTtTtT       "
			, "        TtTtTtTtTtTtTt        "
			, "          tTtTtTtTtT          "
			, "            tTtTtT            "
			, "              tT              "
		]
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
		colors: Breakout.Colors.hf
		, name: "Ender's Game by EnderAndrew"
		, theme: "space"
		, bricks: [
			  ""
			, "aAaAa                         "
			, "aAaAa aA  aA aAaA  aAaAa aAaA "
			, "jJ    jJj jJ jJjjJ jJ    jJ J "
			, "jJjJ  jJjJjJ jJ jJ jJjJ  jJjJj"
			, "mM    mM mMm mMmMm mM    mM mM"
			, "mMmMm mM  mM mMmM  mMmMm mM mM"
			, ""
			, ""
			, "    aAaA                       "
			, "   aAaAa   aAa  aA   aA aAaAa  "
			, "  jJ      jJjJj jJj jJj jJ     "
			, "  jJ  jJj jJ jJ jJ j jJ jJjJ   "
			, "   mMmMm  mMmMm mM   mM mM     "
			, "    mMm   mM mM mM   mM mMmMm  "
		]
	},

	{
		colors: {
			a: '#B8D4FF', // ice blue  (top 3 rows)
			b: '#5588FF', // cornflower (upper body)
			c: '#1A3FCC', // royal blue (equator)
			d: '#000D66', // deep navy  (lower tip)
		}
		, name: "The Gem"
		, theme: "city"
		, bricks: [
			"                              "
			, "              a               "
			, "             aaa              "
			, "            aaaaa             "
			, "           bbbbbbb            "
			, "          bbbbbbbbb           "
			, "         bbbbbbbbbbb          "
			, "        ccccccccccccc         "
			, "         ccccccccccc          "
			, "          ccccccccc           "
			, "           ddddddd            "
			, "            ddddd             "
			, "             ddd              "
			, "              d               "
			, "                              "
		]
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
		, name: "Game Over by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			  ""
			, ""
			, "   lLlLl  blL  lL   b lclLl"
			, "   di     cCb  biI iI ib   "
			, "   bB    bd  b bB b b bB   "
			, "   be    bB  b bB   b bBeb "
			, "   dD dD idDde ed   i id   "
			, "   ed  d de  d dd   e de   "
			, "   eEeEe eE  e eE   e eEeEe"
			, "   "
			, "    lbl  lL  l clLlL lbld  "
			, "   le lL lb  l lL    ld  b "
			, "   bd  d bd  b db    bB  d "
			, "   dD  d dD  d dDdD  eb d  "
			, "   eb  d ed  d ed    bdD   "
			, "   de  d dD d  de    de d  "
			, "    eEe   eEe  eEeEe eE  e "
		]
	},
];