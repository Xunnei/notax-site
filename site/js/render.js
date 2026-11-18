/* notaX · renderizador de artes (fonte única).
 * Usado pelo Estúdio (navegador) e pela geração automática (scripts/render.mjs, Playwright).
 * Uma "arte" é um objeto simples:
 *   { estilo:'funcao'|'capa'|'frase'|'sabia'|'novidade'|'cta'|'lista',
 *     fmt:'q'|'f'|'s', fundo:'violeta'|'escuro'|'palco',
 *     kicker, titulo, sub, pilula, itens:[...], botao, pagina:'2/5' }
 */
(function (root) {
  'use strict';

  var C = { vio:'#421C6F', vio2:'#5A2A8F', vio3:'#311551', gold:'#F4CF6C', gold2:'#C9A227',
    red:'#E8264F', ivory:'#F1E7F9', sub:'#E7D6F5', handle:'#C9A9EC' };

  var DIM = { q:[1080,1080], f:[1080,1350], s:[1080,1920] };
  var ESTILOS = ['funcao','capa','frase','sabia','novidade','cta','lista'];
  var FUNDOS = ['violeta','escuro','palco'];

  var SVG_SIMBOLO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 9 86 86"><circle cx="40" cy="52" r="14" fill="none" stroke="#F4CF6C" stroke-width="2.1" opacity="0.8"/><circle cx="40" cy="52" r="22" fill="none" stroke="#F4CF6C" stroke-width="1.55" opacity="0.54"/><circle cx="40" cy="52" r="30" fill="none" stroke="#F4CF6C" stroke-width="1.15" opacity="0.36"/><path d="M20.72 74.98 L59.28 29.02 M59.28 74.98 L20.72 29.02" stroke="#F1E7F9" stroke-width="4.6" stroke-linecap="round"/><circle cx="40" cy="52" r="5.6" fill="#E8264F"/></svg>';
  var SVG_EMPILHADO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 192 245.70666666666665"><svg x="13" y="0" width="150" height="150" viewBox="-3 9 86 86" overflow="visible"><circle cx="40" cy="52" r="14" fill="none" stroke="#F4CF6C" stroke-width="2.1" opacity="0.8"/><circle cx="40" cy="52" r="22" fill="none" stroke="#F4CF6C" stroke-width="1.55" opacity="0.54"/><circle cx="40" cy="52" r="30" fill="none" stroke="#F4CF6C" stroke-width="1.15" opacity="0.36"/><circle cx="40" cy="52" r="38" fill="none" stroke="#F4CF6C" stroke-width="0.85" opacity="0.2"/><path d="M20.72 74.98 L59.28 29.02 M59.28 74.98 L20.72 29.02" stroke="#F1E7F9" stroke-width="4.6" stroke-linecap="round"/><circle cx="40" cy="52" r="5.6" fill="#E8264F"/></svg><svg x="0" y="164" width="176" height="65.70666666666666" viewBox="4 20 300 112" overflow="visible"><path fill="none" stroke="#F1E7F9" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" d="M10 120 V74 A30 30 0 0 1 70 74 V120 M128 44 A34 38 0 1 1 128 120 A34 38 0 1 1 128 44 M191 28 V108 A12 12 0 0 0 205 120 M176 44 H210 M262 44 A34 38 0 1 1 262 120 A34 38 0 1 1 262 44 M296 44 V120"/></svg></svg>';

  var IMG = { sim:null, emp:null };
  function svgImg(svg){ return new Promise(function(res){ var i=new Image(); i.onload=function(){res(i);}; i.onerror=function(){res(null);};
    i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg); }); }

  /** Carrega logos + fontes. Chame uma vez antes de desenhar. */
  function preparar(){
    var fontes = ['800 88px Sora','700 38px Sora','600 30px Sora','500 38px Sora','400 40px Sora'];
    return Promise.all([svgImg(SVG_SIMBOLO), svgImg(SVG_EMPILHADO)].concat(
      fontes.map(function(f){ try{ return document.fonts.load(f); }catch(e){ return null; } })
    )).then(function(r){ IMG.sim=r[0]; IMG.emp=r[1]; return document.fonts ? document.fonts.ready : null; });
  }

  function normalizar(a){
    a = Object.assign({ estilo:'funcao', fmt:'q', fundo:'violeta', kicker:'', titulo:'', sub:'', pilula:'',
      itens:[], botao:'Chama no direct', pagina:'' }, a||{});
    if (ESTILOS.indexOf(a.estilo)<0) a.estilo='funcao';
    if (!DIM[a.fmt]) a.fmt='q';
    if (FUNDOS.indexOf(a.fundo)<0) a.fundo='violeta';
    if (!Array.isArray(a.itens)) a.itens = String(a.itens||'').split('\n');
    a.itens = a.itens.map(function(s){return String(s).trim();}).filter(Boolean).slice(0,6);
    return a;
  }

  /* ---------- helpers ---------- */
  function fundo(ctx,W,H,a){
    var g, M=Math.max(W,H);
    if(a.fundo==='violeta'){ g=ctx.createRadialGradient(W*.78,H*.18,0,W*.78,H*.18,M*1.1);
      g.addColorStop(0,C.vio2); g.addColorStop(.46,C.vio); g.addColorStop(1,C.vio3); }
    else if(a.fundo==='escuro'){ g=ctx.createRadialGradient(W*.7,H*.2,0,W*.7,H*.2,M*1.15);
      g.addColorStop(0,'#3A1A5E'); g.addColorStop(.5,'#2A1148'); g.addColorStop(1,'#180a30'); }
    else { g=ctx.createRadialGradient(W*.5,H*.22,0,W*.5,H*.22,M*.95);
      g.addColorStop(0,'#6A3AA0'); g.addColorStop(.55,C.vio); g.addColorStop(1,C.vio3); }
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    var palco=a.fundo==='palco', cx=W*(palco?.5:1.02), cy=H*(palco?.24:-.02);
    [[.17,2.4,.8],[.27,1.8,.5],[.38,1.3,.32],[.48,1,.18]].forEach(function(r){
      ctx.beginPath(); ctx.arc(cx,cy,M*r[0],0,Math.PI*2); ctx.strokeStyle=C.gold;
      ctx.globalAlpha=r[2]*.6; ctx.lineWidth=r[1]; ctx.stroke(); });
    ctx.globalAlpha=1;
  }
  function drawImg(ctx,img,x,y,w){ if(!img) return 0; var h=w*(img.height/img.width); ctx.drawImage(img,x,y,w,h); return h; }
  function wrap(ctx,text,maxW){ var words=String(text||'').split(/\s+/).filter(Boolean), lines=[], ln='';
    words.forEach(function(wd){ var t=ln?ln+' '+wd:wd; if(ctx.measureText(t).width>maxW&&ln){lines.push(ln);ln=wd;} else ln=t; });
    if(ln) lines.push(ln); return lines; }
  /** Diminui a fonte até caber em maxLines linhas. */
  function fit(ctx,text,maxW,peso,size,minSize,maxLines){
    for(var s=size; s>=minSize; s-=4){ ctx.font=peso+' '+s+'px Sora'; var l=wrap(ctx,text,maxW); if(l.length<=maxLines) return {lines:l,size:s}; }
    ctx.font=peso+' '+minSize+'px Sora'; return {lines:wrap(ctx,text,maxW),size:minSize}; }
  function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  function espacado(ctx,txt,x,y,gap){ var kx=0; for(var i=0;i<txt.length;i++){ ctx.fillText(txt[i],x+kx,y); kx+=ctx.measureText(txt[i]).width+gap; } }

  function rodape(ctx,W,H,P){
    var y=H-P*0.9;
    ctx.strokeStyle='rgba(244,207,108,.26)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(P,y-54); ctx.lineTo(W-P,y-54); ctx.stroke();
    ctx.textBaseline='alphabetic'; ctx.textAlign='left';
    ctx.font='800 46px Sora'; ctx.fillStyle=C.ivory; ctx.fillText('nota',P,y);
    var w=ctx.measureText('nota').width; ctx.fillStyle=C.gold; ctx.fillText('X',P+w,y);
    ctx.textAlign='right'; ctx.font='600 34px Sora'; ctx.fillStyle=C.handle;
    ctx.fillText('@gestaonotax',W-P,y-4); ctx.textAlign='left';
  }
  function paginacao(ctx,W,P,a){
    if(!a.pagina) return;
    ctx.font='700 30px Sora'; var t=String(a.pagina), w=ctx.measureText(t).width+44;
    ctx.fillStyle='rgba(241,231,249,.12)'; roundRect(ctx,W-P-w,P+24,w,58,29); ctx.fill();
    ctx.fillStyle=C.ivory; ctx.textBaseline='middle'; ctx.fillText(t,W-P-w+22,P+54); ctx.textBaseline='alphabetic';
  }

  /* ---------- desenho principal ---------- */
  function desenhar(ctx,W,H,arte){
    var a=normalizar(arte);
    ctx.clearRect(0,0,W,H); fundo(ctx,W,H,a);
    var P=Math.round(W*.086), e=a.estilo;
    ctx.textAlign='left'; ctx.textBaseline='alphabetic';

    if(e==='capa'){
      var k=a.fmt==='s'?1.3:1, lw=W*(a.fmt==='s'?.5:a.fmt==='f'?.4:.33), lh=lw*(245.7/192);
      ctx.font='400 '+Math.round(40*k)+'px Sora'; var capSub=wrap(ctx,a.sub,W-P*2);
      var bloco=lh+70*k+56*k+capSub.length*54*k, livre=(H-P*0.9-54)-P;
      var ly=P+Math.max(0,(livre-bloco)/2);
      drawImg(ctx,IMG.emp,(W-lw)/2,ly,lw);
      var y=ly+lh+70*k; ctx.textAlign='center';
      ctx.font='600 '+Math.round(44*k)+'px Sora'; ctx.fillStyle=C.gold; ctx.fillText(a.kicker||'Gestão para escolas de samba',W/2,y);
      y+=56*k; ctx.font='400 '+Math.round(40*k)+'px Sora'; ctx.fillStyle=C.sub;
      capSub.forEach(function(t){ ctx.fillText(t,W/2,y); y+=54*k; });
      ctx.textAlign='left'; paginacao(ctx,W,P,a); rodape(ctx,W,H,P); return;
    }

    if(e==='frase'){
      var top=a.fmt==='s'?H*.2:H*.1;
      drawImg(ctx,IMG.sim,(W-150)/2,top,150);
      ctx.textAlign='center'; ctx.fillStyle=C.gold; ctx.font='800 180px Georgia,serif';
      ctx.fillText('“',W/2,top+300);
      var f=fit(ctx,a.titulo,W-P*1.4,'800',80,52,5); ctx.font='800 '+f.size+'px Sora'; ctx.fillStyle=C.ivory;
      var yy=H*.52-(f.lines.length*f.size*1.08)/2+f.size*.8;
      f.lines.forEach(function(t){ ctx.fillText(t,W/2,yy); yy+=f.size*1.08; });
      if(a.sub){ yy+=24; ctx.font='500 38px Sora'; ctx.fillStyle=C.handle;
        wrap(ctx,a.sub,W-P*2).forEach(function(t){ ctx.fillText(t,W/2,yy); yy+=50; }); }
      ctx.textAlign='left'; paginacao(ctx,W,P,a); rodape(ctx,W,H,P); return;
    }

    // funcao / sabia / novidade / cta / lista: símbolo no topo + bloco de texto
    drawImg(ctx,IMG.sim,P,P,118);
    paginacao(ctx,W,P,a);
    var footY=H-P*0.9-54, maxW=W-P*2;
    var selo = e==='sabia' ? 'Você sabia?' : e==='novidade' ? 'Novidade' : (a.kicker || (e==='cta'?'notaX':''));
    var isLista = e==='lista' && a.itens.length;
    var ft=fit(ctx,a.titulo,maxW,'800',isLista?76:88,50,isLista?3:4);
    ctx.font='400 40px Sora'; var subL=a.sub?wrap(ctx,a.sub,maxW):[];
    ctx.font='500 40px Sora'; var itensL=isLista?a.itens.map(function(t){return wrap(ctx,t,maxW-70);}):[];
    var itensH=itensL.reduce(function(s,l){return s+l.length*50+26;},0);
    var pill=!!a.pilula && (e==='funcao'||e==='novidade'||e==='sabia');
    var blocoH=46+30+ft.lines.length*ft.size*1.04+(subL.length?34+subL.length*54:0)+(isLista?30+itensH:0)+(pill?110:0)+(e==='cta'?130:0);
    var y2 = a.fmt==='s' ? Math.max(P+170,H*.46-blocoH/2) : Math.max(P+170,footY-blocoH-18);

    if(selo){ ctx.font='600 30px Sora'; ctx.fillStyle=C.gold; espacado(ctx,selo.toUpperCase(),P,y2,6); }
    y2+=56;
    ctx.font='800 '+ft.size+'px Sora'; ctx.fillStyle=C.ivory;
    ft.lines.forEach(function(t){ ctx.fillText(t,P,y2+ft.size*.82); y2+=ft.size*1.04; });
    if(subL.length){ y2+=18; ctx.font='400 40px Sora'; ctx.fillStyle=C.sub;
      subL.forEach(function(t){ ctx.fillText(t,P,y2+32); y2+=54; }); }
    if(isLista){ y2+=30; ctx.font='500 40px Sora';
      itensL.forEach(function(ls){
        ctx.fillStyle=C.gold; ctx.beginPath(); ctx.arc(P+16,y2+20,9,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=C.ivory; ls.forEach(function(t,i){ ctx.fillText(t,P+70,y2+34+i*50); });
        y2+=ls.length*50+26; }); }
    if(pill){ y2+=40; var pad=30; ctx.font='600 34px Sora'; var pw=Math.min(maxW,ctx.measureText(a.pilula).width+pad*2);
      ctx.fillStyle='rgba(244,207,108,.14)'; ctx.strokeStyle='rgba(244,207,108,.4)'; ctx.lineWidth=2;
      roundRect(ctx,P,y2,pw,70,35); ctx.fill(); ctx.stroke();
      ctx.fillStyle=C.gold; ctx.textBaseline='middle'; ctx.fillText(a.pilula,P+pad,y2+37); ctx.textBaseline='alphabetic'; }
    if(e==='cta'){ y2+=40; var pd=34; ctx.font='700 38px Sora'; var txt=a.botao||'Chama no direct';
      var bw=ctx.measureText(txt).width+pd*2; ctx.fillStyle=C.gold; roundRect(ctx,P,y2,bw,90,45); ctx.fill();
      ctx.fillStyle='#3a2708'; ctx.textBaseline='middle'; ctx.fillText(txt,P+pd,y2+47); ctx.textBaseline='alphabetic'; }
    rodape(ctx,W,H,P);
  }

  /** Desenha num canvas (ajusta o tamanho pelo formato). */
  function emCanvas(canvas,arte){
    var a=normalizar(arte), d=DIM[a.fmt]; canvas.width=d[0]; canvas.height=d[1];
    desenhar(canvas.getContext('2d'),d[0],d[1],a); return canvas;
  }

  root.NotaxArte = { C:C, DIM:DIM, ESTILOS:ESTILOS, FUNDOS:FUNDOS, preparar:preparar, normalizar:normalizar, desenhar:desenhar, emCanvas:emCanvas };
})(typeof window!=='undefined'?window:this);
