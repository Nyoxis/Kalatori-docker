function identicon_init(e,size,css) { if(!e) e=document; if(!size) size=128;
    // add identicon to all DIV with class "identicon"
    var pp = ( e.tagName=='DIV' && e.getAttribute('identicon') ? [e] : e.querySelectorAll('DIV[identicon]') );
    pp.forEach(function(p){
	if(p.classList.contains('identicon_done')) return;
	var adr=p.getAttribute('identicon'); // attribute identicon="5GbgpMNkENaf4rZmioBtPmkb7UZb4YSozVPdWp9fa2CtdKdZ"
	if(!adr||adr=='') { // if no attribute identicon, try to find address in classList
    	    adr=false;
    	    for(var c of p.classList) if(c.length==48 || c.startsWith('0x') || 1*c) { adr=c; break; }
	}
	if(adr==false) adr=p.innerHTML; // if no address in classList, take address in innerHTML
	p.innerHTML="<div style='display:inline-block; width:"+p.offsetHeight+"px;height:"+p.offsetHeight+"px"+(css?css:'')+"'>"
+identicon_render(adr,size)+"</div>&nbsp;"+p.innerHTML;
	p.classList.add('identicon_done');
    });

    // add identicon to radio buttons (in blocks with class "identicon")
    e.querySelectorAll(".identicon input[type='radio']").forEach(function(p){
	if(p.classList.contains('identicon_done')) return;
	var c=p.value;
	var next=p.nextSibling;
	if(next) {
    	    if(!next.innerHTML) {
        	// create div inline instead of text node
        	var div = document.createElement('div');
        	div.innerHTML = next.nodeValue;
        	div.style.display = 'inline-block';
        	next.parentNode.insertBefore(div, next);
        	next.parentNode.removeChild(next);
        	next = div;
    	    }
    	    var cc = next.innerHTML;
    	    if(c.length!=48 && !c.startsWith('0x') && !(1*c)) c=cc;
    	    next.innerHTML = "<div style='display:inline-block; width:"+next.offsetHeight+"px;height:"+next.offsetHeight+"px'>"+identicon_render(c)+"</div>&nbsp;"+cc;
	}
	p.classList.add('identicon_done');
    });
}

function round0(x) { return Math.round(x*10)/10; }

function identicon_render(address, size, sixPoint) {
    if(!size) size=128;
    if(typeof(identicon_render_zero)=='undefined') identicon_render_zero = polkadotUtilCrypto.blake2AsU8a(new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]),512);
	let s = 64;
	let c = round0( s / 2 );
	let r = round0( sixPoint ? (s / 2 / 8 * 5) :  (s / 2 / 4 * 3) );
	let rroot3o2 = round0( r * Math.sqrt(3) / 2 );
	let ro2 = round0( r / 2 );
	let rroot3o4 = round0( r * Math.sqrt(3) / 4 );
	let ro4 = round0( r / 4 );
	let r3o4 = round0( r * 3 / 4 );

	let z = round0( s / 64 * 5 );
	let schema = {
		target: { freq: 1, colors: [0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 1] },
		cube: { freq: 20, colors: [0, 1, 3, 2, 4, 3, 0, 1, 3, 2, 4, 3, 0, 1, 3, 2, 4, 3, 5] },
		quazar: { freq: 16, colors: [1, 2, 3, 1, 2, 4, 5, 5, 4, 1, 2, 3, 1, 2, 4, 5, 5, 4, 0] },
		flower: { freq: 32, colors: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 3] },
		cyclic: { freq: 32, colors: [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 6] },
		vmirror: { freq: 128, colors: [0, 1, 2, 3, 4, 5, 3, 4, 2, 0, 1, 6, 7, 8, 9, 7, 8, 6, 10] },
		hmirror: { freq: 128, colors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 8, 6, 7, 5, 3, 4, 2, 11] }
	}

	let total = Object.keys(schema).map(k => schema[k].freq).reduce((a, b) => a + b)
	let findScheme = d => {
		let cum = 0
		let ks = Object.keys(schema)
		for (let i in ks) {
			let n = schema[ks[i]].freq
			cum += n;
			if (d < cum) {
				return schema[ks[i]]
			}
		}
		throw "Impossible"
	}
	
	let id = typeof address == 'string' ? polkadotUtilCrypto.decodeAddress(address) : address
	if (!(typeof id == 'object' && id && id instanceof Uint8Array && id.length == 32)) {
		return "<svg height=128 width=128 viewBox='0 0 64 64' />";
	}
	let ss58 = polkadotUtilCrypto.encodeAddress(id); // ss58Encode(id);
	id = Array.from(polkadotUtilCrypto.blake2AsU8a(id,512)).map((x, i) => (x + 256 - identicon_render_zero[i]) % 256)

	let sat = (Math.floor(id[29] * 70 / 256 + 26) % 80) + 30
	let d = Math.floor((id[30] + id[31] * 256) % total)
	let scheme = findScheme(d)
	let palette = Array.from(id).map((x, i) => {
		let b = (x + i % 28 * 58) % 256
		if (b == 0) { return '#444' }
		if (b == 255) { return 'transparent' }
		let h = Math.floor(b % 64 * 360 / 64)
		let l = [53, 15, 35, 75][Math.floor(b / 64)]
		return `hsl(${h}, ${sat}%, ${l}%)`
	})

	let rot = (id[28] % 6) * 3

	let colors = scheme.colors.map((_, i) => palette[scheme.colors[i < 18 ? (i + rot) % 18 : 18]])
	let i = 0;

	return "<svg width='"+size+"' height='"+size+"' viewBox='0 0 64 64'>"
		+"<circle r='"+(s / 2)+"' fill='#eee' cx='"+(s / 2)+"' cy='"+(s / 2)+"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+c+"' cy='"+(c - r)+"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+c+"' cy='"+(c - ro2)+"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+(c - rroot3o4)+"' cy='"+(c - r3o4)+"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+(c - rroot3o2)+"' cy='"+(c - ro2) +"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+(c - rroot3o4)+"' cy='"+(c - ro4) +"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+(c - rroot3o2)+"' cy='"+c         +"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+(c - rroot3o2)+"' cy='"+(c + ro2) +"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+(c - rroot3o4)+"' cy='"+(c + ro4) +"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+(c - rroot3o4)+"' cy='"+(c + r3o4)+"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+c             +"' cy='"+(c + r)   +"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+c             +"' cy='"+(c + ro2) +"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+(c + rroot3o4)+"' cy='"+(c + r3o4)+"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+(c + rroot3o2)+"' cy='"+(c + ro2) +"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+(c + rroot3o4)+"' cy='"+(c + ro4) +"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+(c + rroot3o2)+"' cy='"+c         +"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+(c + rroot3o2)+"' cy='"+(c - ro2) +"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+(c + rroot3o4)+"' cy='"+(c - ro4) +"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+(c + rroot3o4)+"' cy='"+(c - r3o4)+"' />"
		+"<circle r='"+z+"' fill='"+colors[i++]+"' cx='"+c             +"' cy='"+c          +"'/>"
	+"</svg>";
}
