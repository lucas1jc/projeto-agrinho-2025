let estadoJogo = "introducao";
let tempoUltimaRegagem = 0;
let plantas = [];
let gotas = [];
let insetos = [];
let girassoisColhidos = [];
let numeroDePlantas = 20;
let ySolo;
let dia = true;
let mensagem = "";
let faseDialogo = 0;

function setup() {
  createCanvas(800, 400);
  ySolo = height - 50;
  for (let i = 0; i < numeroDePlantas; i++) {
    plantas.push(new PlantaGirassol(random(100, width - 100), ySolo));
  }
}

function draw() {
  if (estadoJogo !== "final") atualizarCicloDiaNoite();

  dia ? background(135, 206, 235) : background(20, 24, 50);
  fill(40, 180, 70);
  rect(0, ySolo, width, 50);

  if (estadoJogo === "introducao") mostrarIntroducao();
  else if (estadoJogo === "plantando") fasePlantio();
  else if (estadoJogo === "protegendo") faseProtecao();
  else if (estadoJogo === "colhendo") faseColheita();
  else if (estadoJogo === "industria") faseIndustria();
  else if (estadoJogo === "final") mostrarFinal();

  for (let i = gotas.length - 1; i >= 0; i--) {
    gotas[i].atualizar();
    gotas[i].mostrar();
    if (gotas[i].estaForaDaTela()) gotas.splice(i, 1);
  }

  for (let i = insetos.length - 1; i >= 0; i--) {
    insetos[i].mover();
    insetos[i].mostrar();
    if (mouseIsPressed && dist(mouseX, mouseY, insetos[i].x, insetos[i].y) < 20) insetos.splice(i, 1);
  }
}

function mostrarIntroducao() {
  mostrarMensagem("[Sementinha] Oi! Eu sou a Sementinha! Vamos plantar juntos?");
}

function fasePlantio() {
  for (let planta of plantas) {
    planta.regar();
    planta.crescer();
    planta.mostrar();
  }
  mostrarMensagem("Regue os girassóis clicando com o mouse!");

  if (mouseIsPressed && millis() - tempoUltimaRegagem > 100) {
    for (let planta of plantas) planta.regar();
    for (let i = 0; i < 5; i++) gotas.push(new Gota(mouseX, mouseY));
    tempoUltimaRegagem = millis();
  }

  if (checarCrescimento()) {
    estadoJogo = "protegendo";
    for (let i = 0; i < 10; i++) insetos.push(new Inseto(random(width), random(height / 2)));
  }
}

function faseProtecao() {
  for (let planta of plantas) planta.mostrar();
  mostrarMensagem("[Lumin] Afaste os insetos para proteger os girassóis!");

  if (insetos.length === 0) estadoJogo = "colhendo";
}

function faseColheita() {
  for (let planta of plantas) {
    if (!planta.colhida && mouseIsPressed && dist(mouseX, mouseY, planta.x, planta.y - planta.altura) < 20) {
      planta.colhida = true;
      girassoisColhidos.push(planta);
    }
    planta.mostrar();
  }
  mostrarMensagem("Clique nos girassóis prontos para colher!");

  if (plantas.every(p => p.colhida)) estadoJogo = "industria";
}

function faseIndustria() {
  background(200);
  fill(50);
  rect(0, ySolo, width, 50);
  fill(100);
  rect(100, 150, 600, 200);
  textAlign(CENTER);
  fill(255);
  textSize(20);
  text("Retire as sementes clicando nos girassóis cortados!", width / 2, 100);

  for (let i = 0; i < girassoisColhidos.length; i++) {
    let g = girassoisColhidos[i];
    g.x = 150 + i * 50;
    g.y = height / 2 + 50;
    g.mostrarNaIndustria();
    if (mouseIsPressed && dist(mouseX, mouseY, g.x, g.y - g.altura) < 20) girassoisColhidos.splice(i, 1);
  }

  if (girassoisColhidos.length === 0) estadoJogo = "final";
}

function mostrarFinal() {
  background(230);
  mostrarMensagem("Parabéns! Você completou o ciclo dos girassóis!");
}

function mousePressed() {
  if (estadoJogo === "introducao") estadoJogo = "plantando";
}

function mostrarMensagem(msg) {
  fill(0);
  textSize(18);
  textAlign(CENTER);
  text(msg, width / 2, 30);
}

function atualizarCicloDiaNoite() {
  if (frameCount % 300 === 0) dia = !dia;
}

function checarCrescimento() {
  return plantas.every(p => p.altura > 50);
}

class PlantaGirassol {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.altura = 0;
    this.maxAltura = 100;
    this.velocidadeCrescimento = 0.2;
    this.necessitaAgua = true;
    this.colhida = false;
  }
  regar() {
    if (this.altura < this.maxAltura) this.necessitaAgua = false;
  }
  crescer() {
    if (!this.necessitaAgua && this.altura < this.maxAltura) this.altura += this.velocidadeCrescimento;
    else this.altura = max(0, this.altura - 0.1);
  }
  mostrar() {
    if (this.colhida) return;
    fill(34, 139, 34);
    rect(this.x - 5, this.y - this.altura, 10, this.altura);
    if (this.altura > 50) fill(255, 215, 0);
    else fill(200);
    ellipse(this.x, this.y - this.altura, 30, 30);
  }
  mostrarNaIndustria() {
    fill(255, 215, 0);
    ellipse(this.x, this.y - this.altura, 30, 30);
    fill(34, 139, 34);
    rect(this.x - 5, this.y - 40, 10, 50);
  }
}

class Gota {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocidade = 3;
    this.transparencia = 255;
  }
  atualizar() {
    this.y += this.velocidade;
    this.transparencia -= 5;
  }
  mostrar() {
    fill(0, 0, 255, this.transparencia);
    noStroke();
    ellipse(this.x, this.y, 10, 10);
  }
  estaForaDaTela() {
    return this.y > height || this.transparencia <= 0;
  }
}

class Inseto {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  mover() {
    this.x += random(-2, 2);
    this.y += random(-2, 2);
  }
  mostrar() {
    fill(100);
    ellipse(this.x, this.y, 10, 10);
    line(this.x - 5, this.y, this.x + 5, this.y);
  }
}
