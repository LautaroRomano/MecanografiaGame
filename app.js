const wordsArray = ['MESA','SILLA','VENTANA','COMPTADORA','HUMANIDAD','PERSONA','MUJER','BEBE','NIÑO','ADOLECENTE','CABALLERO','INDIVIDUO','CUERPO','PIERNA','PIE','TALON','MUSLO','BOCA','OJOS','CABELLO','OREJA','CEREBRO','CORAZON','MENTE','SALUD','ENFERMEDAD','FAMILIA','AMIGOS','PAREJA','AMOR','CRIATURA','NATURALEZA'];

const canvas = document.querySelector('canvas'); //traer el canvas del html
const c = canvas.getContext('2d');               //declarar el canvas en 2d

const scorelbl = document.querySelector('#score');
const startGameBtn = document.querySelector('#startGameBtn');
const modal = document.querySelector('#modal');
const scoreH1 = document.querySelector('#scoreH1');

canvas.width = innerWidth;                       //dar dimensines
canvas.height = innerHeight;

class Player {                                  //objeto player x,y: position radius: 1/2 del tamaño color: color del player
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {                                     //pinta un circulo con las propiedades del jugador
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

}

class Projectile {                              //Objeto proyectil
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {                                     //pintar un proyectil
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()                              //mover el proyectil en una direccion
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }

}

class Enemy {                              //Objeto enemigo
    constructor(x, y, radius, color, velocity,text) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.text = text
    }

    draw() {                                     //pintar un enemigo
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.fillStyle = 'white'
        c.textAlign = 'center'
        c.font = "italic small-caps bold 12px arial";
        c.fillText(this.text,this.x,this.y + this.radius*2,300);
    }

    update() {
        this.draw()                              //mover el proyectil en una direccion
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }

}

const friction = 0.99
class Particle {                              //Objeto enemigo
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {           
        c.save()                          //pintar un enemigo
        c.globalAlpha = this.alpha                          
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()                              //mover el proyectil en una direccion
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }

}

let player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white');
let projectiles = [];
let enemies = [];
let particles = [];

    function init(){
        score = 0;
        player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white');
        projectiles = [];
        enemies = [];
        particles = [];

        scoreH1.innerHTML = 0;
        scorelbl.innerHTML = 0;
    }


function spawnEnemy() {
    setInterval(() => {
        const radius = Math.random() * (30-5) + 5;
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

        let x=0;
        let y=0;
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;    
        }
        
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle) * 0.6,
            y: Math.sin(angle) * 0.6
        }
        let integerRandom = Math.floor(Math.random()* wordsArray.length);
        let parabraRandom = wordsArray[integerRandom];
        enemies.push(new Enemy(x, y, parabraRandom.length * 5, color, velocity, parabraRandom ));
    }, 2000)
}


let animationID
let score = 0;
function animate() {                             //funcion en bucle

    animationID = requestAnimationFrame(animate)

    c.fillStyle = 'rgba(0,0,0,.2)'
    c.fillRect(0, 0, canvas.width, canvas.height)

    player.draw()
    particles.forEach((particle, index)=>{
        if(particle.alpha <= 0){
            particles.splice(index);
        } else{
            particle.update();
        }
    })

    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update()

        //remover cuando se salga de la pantalla
        if(projectile.x - projectile.radius < 0 
            || projectile.x + projectile.radius > canvas.width
            || projectile.y + projectile.radius < 0
            || projectile.y + projectile.radius > canvas.height){
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1)
            }, 0);
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update()
        
        //end game
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if(dist - enemy.radius - player.radius < 0.7 ){
            cancelAnimationFrame(animationID)
            modal.style.display = 'flex';
            scoreH1.innerHTML = score;
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if(dist - enemy.radius - projectile.radius < 1 ){

                for(let i = 0; i< enemy.radius * 2; i++){
                    particles.push(new Particle(
                        projectile.x,
                        projectile.y,
                        Math.random() * 3,
                        enemy.color,
                        {
                            x: (Math.random() - 0.5 ) * Math.random() * 8,
                            y: (Math.random() - 0.5 ) * Math.random() * 8
                        }
                    ))
                }

                if(enemy.radius > 10 ){
                    //incrementar el score
                    score += 1;
                    gsap.to(enemy, {
                        radius: enemy.radius - 6
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0);
                }
                if(enemy.text.length <= 0 ){
                    //incrementar el score
                    score += 10;
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0);
                }

                //cambiar el score
                scorelbl.innerHTML = score;
            }
        })
    })

}

addEventListener('keydown', (e) => {

    enemies.forEach((enemy)=>{

        if(enemy.text[0] == e.key.toUpperCase()){
            enemy.text =  enemy.text.substr(1,enemy.text.length);

            const angle = Math.atan2(enemy.y - canvas.height / 2, enemy.x - canvas.width / 2)
            const velocity = {
                x: Math.cos(angle) * 12,
                y: Math.sin(angle) * 12
            }
            projectiles.push(
                new Projectile(
                    canvas.width / 2,
                    canvas.height / 2,
                    5,
                    'white',
                    velocity,
                )
            )
            
        }
    });

})

startGameBtn.addEventListener('click',()=>{
    init()
    animate()
    spawnEnemy()
    modal.style.display = 'none';

})