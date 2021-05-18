const map_canvas = document.getElementById('map-canvas');
const game_canvas = document.getElementById('game-canvas');
const player_canvas = document.getElementById('player-canvas');
const ctx = game_canvas.getContext('2d');
const pctx = player_canvas.getContext('2d');
const mctx = map_canvas.getContext('2d');
const canvas_wrapper = document.querySelector('.main-wrapper');
const player_id = document.getElementById("player-id").innerHTML;
const location_name_div = document.getElementById('location-name');
const nick_div = document.getElementById('nick');
const level_div = document.getElementById('level');
const cords_div = document.getElementById('coords');
const gold_div = document.getElementById('gold-bar');
const premium_div = document.getElementById('premium-bar');
const hit_points_info_div = document.getElementById('hit-points');
const damage_info_div = document.getElementById('damage');
const armor_info_div = document.getElementById('armor');
const speed_info_div = document.getElementById('speed');
const loading_overlay = document.querySelector('.loading-overlay');
const tooltip_div = document.querySelector('.tooltip');
const map_image = new Image();
const player_image_up = new Image();
const player_image_down = new Image();
const player_image_right = new Image();
const player_image_left = new Image();
const npc_image_table = new Array();
const enemy_image_table = new Array();
const door_image_table = new Array();
player_image_down.src = "../../media/character_down.png";
player_image_up.src = "../../media/character_up.png";
player_image_right.src = "../../media/character_right.png";
player_image_left.src = "../../media/character_left.png";
let allow_move = true;
let continue_animate;
let player;
let req_id;
let start_pos;
let fin_pos;
let move_direction;
let ready_to_draw = false;

player_image_left.addEventListener('load', function () {
    ajax_init();
});

game_canvas.width = canvas_wrapper.offsetWidth;
game_canvas.height = canvas_wrapper.offsetHeight;

player_canvas.width = canvas_wrapper.offsetWidth;
player_canvas.height = canvas_wrapper.offsetHeight;

map_canvas.width = canvas_wrapper.offsetWidth;
map_canvas.height = canvas_wrapper.offsetHeight;

class MapElement {

    constructor(x, y, npc, enemy, door, collision) {
        this.x = x;
        this.y = y;
        this.npc = npc;
        this.enemy = enemy;
        this.door = door;
        this.player = player;
        this.collision = collision;
    }

    showMapElement() {
        ctx.beginPath();
        ctx.lineWidth = "2";
        ctx.strokeStyle = "white";
        ctx.rect(this.x, this.y, 32, 32);
        ctx.stroke();
    }
}

class Enemy {

    constructor(x, y, name, level, image) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.level = level;
        this.image = image;
        this.ready = false;
    }
}

class Door {

    constructor(x, y, to_id, to_name, image, to_x, to_y, direction) {
        this.x = x;
        this.y = y;
        this.to_id = to_id;
        this.to_name = to_name;
        this.image = image;
        this.to_x = to_x;
        this.to_y = to_y;
        this.direction = direction;
    }
}

class Player {

    constructor(nick, x, y, level, experience, location, gold, premium_gold,
                hit_points, current_hit_points, damage, armor, attack_speed) {
        this.nick = nick;
        this.x = x;
        this.y = y;
        this.level = level;
        this.experience = experience;
        this.location = location;
        this.gold = gold;
        this.premium_gold = premium_gold;
        this.hit_points = hit_points;
        this.current_hit_points = current_hit_points;
        this.damage = damage;
        this.armor = armor;
        this.attack_speed = attack_speed;
    }

    updateExp() {

        let lvl_exp = Math.pow(this.level, 4);
        let next_lvl_exp = Math.pow((this.level + 1), 4);
        let exp_bar = document.getElementById('exp-bar-progress');
        let exp_between = next_lvl_exp - lvl_exp;
        let lvl_exp_bar = this.experience - lvl_exp;
        let progress = (lvl_exp_bar * 100) / exp_between;
        let progress_string = progress.toString() + "%";
        exp_bar.style.width = progress_string;
    }

    updateHealthBar() {
        let health_bar = document.getElementById('hit-points-bar-filling');
        let health_percent_div = document.getElementById('hit-points-percent');
        let health_status = (this.current_hit_points/this.hit_points) * 100;
        let health_string = health_status.toString() + "%";
        health_bar.style.width = health_string;
        health_percent_div.innerHTML = health_string;
    }

    drawPlayer() {

        switch(move_direction) {
            case "s":
                pctx.drawImage(player_image_down, this.x * 32 + 1, this.y * 32 - 15);
                break;
            case "w":
                pctx.drawImage(player_image_up, this.x * 32 + 1, this.y * 32 - 15);
                break;
            case "a":
                pctx.drawImage(player_image_left, this.x * 32 + 1, this.y * 32 - 15);
                break;
            case "d":
                pctx.drawImage(player_image_right, this.x * 32 + 1, this.y * 32 - 15);
                break;
            default:
                pctx.drawImage(player_image_down, this.x * 32 + 1, this.y * 32 - 15);
                break;
        }
    }

    updateCoords() {
        cords_div.innerHTML = this.x + ', ' + this.y;
        let player_to_update = {x: this.x, y: this.y,};
        updatePosition(player_to_update);
    }
}

let map_elements = new Array(23);

for (let i = 0; i<map_elements.length; i++) {
    map_elements[i] = new Array(18);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

function updatePosition(player_to_update) {

    $.ajax({
      url: "http://127.0.0.1:8000/engine/rest/players/" + player_id + "/",
      type: 'PATCH',
      method: 'PATCH',
      headers: {'X-CSRFToken': csrftoken},
      data: player_to_update,
    });
}

function load(data) {
    player = new Player(
        data.user.username, data.x, data.y, data.level, data.experience, data.location, data.gold, data.premium_gold,
        data.hit_points, data.current_hit_points, data.damage, data.armor, data.attack_speed
    );

    nick_div.innerHTML = player.nick;
    level_div.innerHTML = 'Poziom: ' + player.level;
    cords_div.innerHTML = player.x + ', ' + player.y;
    gold_div.innerHTML = player.gold;
    premium_div.innerHTML = player.premium_gold;
    hit_points_info_div.innerHTML = player.hit_points;
    damage_info_div.innerHTML = player.damage;
    armor_info_div.innerHTML = player.armor;
    speed_info_div.innerHTML = player.attack_speed;
    player.updateExp();
    player.updateHealthBar();
}

function loadLocation(data) {
    for(let i = 0; i<data.location_spot.length; i++) {

    let spot = data.location_spot[i];

        if(spot.collision == true) {
            map_elements[spot.x][spot.y].collision = true;
        }

        if(spot.enemy != null) {
            map_elements[spot.x][spot.y].enemy = new Enemy(
                spot.x,
                spot.y,
                spot.enemy.name,
                spot.enemy.level,
                spot.enemy.image
            );

            enemy_image_table.push(new Image());
            enemy_image_table[enemy_image_table.length-1].src = spot.enemy.image;
            enemy_image_table[enemy_image_table.length-1].addEventListener('load', function() {
                ctx.drawImage(this, spot.x * 32 + 1, spot.y * 32 + 1);
            });
            let new_tooltip = tooltip_div.cloneNode(true);
            let tooltip_was_displayed = false;

            canvas_wrapper.addEventListener('mousemove', addTooltipEnemy);

            function addTooltipEnemy(event) {
                if(map_elements[spot.x][spot.y].enemy == null) {
                    canvas_wrapper.removeEventListener('mousemove', addTooltipEnemy);
                } else {
                    if(event.offsetX >= spot.x * 32 &&
                    event.offsetX <= (spot.x + 1) * 32 &&
                    event.offsetY >= spot.y * 32 &&
                    event.offsetY <= (spot.y + 1) * 32) {
                        if (new_tooltip == null) {
                            new_tooltip = tooltip_div.cloneNode(true);
                        }
                        canvas_wrapper.appendChild(new_tooltip);
                        new_tooltip.style.left = (spot.x * 32 - 20) + 'px';
                        new_tooltip.style.top = (spot.y * 32 - 20) + 'px';
                        new_tooltip.innerHTML = spot.enemy.name + " (" +
                                                spot.enemy.level + ")";
                        new_tooltip.style.display = 'block';
                        tooltip_was_displayed = true;
                    } else {
                        if (new_tooltip != null && tooltip_was_displayed == true) {
                            new_tooltip.style.display = 'none';
                            canvas_wrapper.removeChild(new_tooltip);
                            new_tooltip = null;
                        }
                    }
                }
            }

        } else if(spot.door != null) {

            let door_direction_string;

            switch(spot.door_direction) {
                case 1:
                    door_direction_string = 'door_up.png';
                    break;
                case 2:
                    door_direction_string = 'door_left.png';
                    break;
                case 3:
                    door_direction_string = 'door_down.png';
                    break;
                case 4:
                    door_direction_string = 'door_right.png';
                    break;
                default:
                    door_direction_string = '';
                    break;
            }
            map_elements[spot.x][spot.y].door = new Door(
                spot.x,
                spot.y,
                spot.door.location_name.id,
                spot.door.location_name.name,
                "../../media/" + door_direction_string,
                spot.door.x,
                spot.door.y,
                spot.door_direction
            );

            door_image_table.push(new Image());
            door_image_table[door_image_table.length-1].src = map_elements[spot.x][spot.y].door.image;
            door_image_table[door_image_table.length-1].addEventListener('load', function() {
                ctx.drawImage(this, spot.x * 32 + 1, spot.y * 32 + 1);
            });

            let new_tooltip = tooltip_div.cloneNode(true);
            let tooltip_was_displayed = false;

            canvas_wrapper.addEventListener('mousemove', addTooltipDoor);

            function addTooltipDoor(event) {
                if (map_elements[spot.x][spot.y].door == null) {
                    canvas_wrapper.removeEventListener('mousemove', addTooltipDoor);
                } else {
                    if(event.offsetX >= spot.x * 32 &&
                    event.offsetX <= (spot.x + 1) * 32 &&
                    event.offsetY >= spot.y * 32 &&
                    event.offsetY <= (spot.y + 1) * 32) {
                        if (new_tooltip == null) {
                            new_tooltip = tooltip_div.cloneNode(true);
                        }
                        canvas_wrapper.appendChild(new_tooltip);
                        new_tooltip.style.left = (spot.x * 32 - 20) + 'px';
                        new_tooltip.style.top = (spot.y * 32 - 20) + 'px';
                        new_tooltip.innerHTML = spot.door.location_name.name;
                        new_tooltip.style.color = 'blue';
                        new_tooltip.style.display = 'block';
                        tooltip_was_displayed = true;
                    } else {
                        if (new_tooltip != null && tooltip_was_displayed == true) {
                            new_tooltip.style.display = 'none';
                            canvas_wrapper.removeChild(new_tooltip);
                            new_tooltip = null;
                        }
                    }
                }
            }
        }
    }
}

function animatePlayerMove() {

    allow_move = false;
    continue_animate = true;

    switch(move_direction) {
        case "s":
            if(start_pos >= fin_pos - 0.05) {
                player.y = fin_pos;
                continue_animate = false;
            } else {
                pctx.clearRect(0, 0, player_canvas.width, player_canvas.height);
                player.y = player.y + 0.1;
                start_pos = start_pos + 0.1;
                player.drawPlayer();
            }
            break;

        case "w":
            if(start_pos <= fin_pos + 0.05) {
                player.y = fin_pos;
                continue_animate = false;
            } else {
                pctx.clearRect(0, 0, player_canvas.width, player_canvas.height);
                player.y = player.y - 0.1;
                start_pos = start_pos - 0.1;
                player.drawPlayer();
            }
            break;

        case "a":
            if(start_pos <= fin_pos + 0.05) {
                player.x = fin_pos;
                continue_animate = false;
            } else {
                pctx.clearRect(0, 0, player_canvas.width, player_canvas.height);
                player.x = player.x - 0.1;
                start_pos = start_pos - 0.1;
                player.drawPlayer();
            }
            break;

        case "d":
            if(start_pos >= fin_pos - 0.05) {
                player.x = fin_pos;
                continue_animate = false;
            } else {
                pctx.clearRect(0, 0, player_canvas.width, player_canvas.height);
                player.x = player.x + 0.1;
                start_pos = start_pos + 0.1;
                player.drawPlayer();
            }
            break;

        default:
            break;
    }

    req_id = requestAnimationFrame(animatePlayerMove);

    if (continue_animate == false) {
        player.updateCoords();
        allow_move = true;
        if (map_elements[player.x][player.y].door != null) {
            allow_move = false;
            changeDirection(map_elements[player.x][player.y].door);
        }
        cancelAnimationFrame(req_id);
    }
}

let loadLocationMap = function() {
    map_image.addEventListener('load', function() {
        mctx.drawImage(map_image, 0, 0);
    });
    map_image.src = "../../media/location_" + player.location + ".png";
}

function ajax_init() {

    for(let i = 0; i<map_elements.length; i++) {
        for (let j = 0; j<map_elements[i].length; j++) {
            map_elements[i][j] = new MapElement(i * 32 + 1, j * 32 +1, null, null, null, false);
        }
    }

    $.ajax({
        url: "http://127.0.0.1:8000/engine/rest/players/" + player_id + "/",
        type: 'GET',
        method: 'GET',
        success: function(data) {
            load(data);
        }
    }).then(function() {

        loadLocationMap();

        $.ajax({
            url: "http://127.0.0.1:8000/engine/rest/locations/" + player.location + "/",
            type: 'GET',
            method: 'GET',
            success: function(data) {
                loadLocation(data);
                location_name_div.innerHTML = data.name;
            }
        });
    }).then(function() {
        player.drawPlayer();
        setTimeout(function() {loading_overlay.style.display = 'none';}, 300);
        allow_move = true;
    });
}

function changeDirection(door) {
    loading_overlay.style.display = 'block';
    player.location = door.to_id;
    ctx.clearRect(0, 0, game_canvas.width, game_canvas.height);
    pctx.clearRect(0, 0, player_canvas.width, player_canvas.height);
    mctx.clearRect(0, 0, player_canvas.width, player_canvas.height);

    $.ajax({
      url: "http://127.0.0.1:8000/engine/rest/players/" + player_id + "/",
      type: 'PATCH',
      method: 'PATCH',
      headers: {'X-CSRFToken': csrftoken},
      data: {
      x: door.to_x,
      y: door.to_y,
      location: door.to_id,
      },
    }).then(function() {ajax_init()});

}

document.addEventListener("keydown", function(event) {

    if(allow_move == true) {

        switch(event.key) {

            case "ArrowDown":
            case "s":
                if(player.y < 17 && map_elements[player.x][player.y + 1].collision == false) {
                    move_direction = 's';
                    start_pos = player.y;
                    fin_pos = player.y + 1;
                    animatePlayerMove();
                }
                break;

            case "ArrowUp":
            case "w":
                if(player.y > 0 && map_elements[player.x][player.y - 1].collision == false) {
                    move_direction = 'w';
                    start_pos = player.y;
                    fin_pos = player.y - 1;
                    animatePlayerMove();
                }
                break;

            case "ArrowLeft":
            case "a":
                if(player.x > 0 && map_elements[player.x - 1][player.y].collision == false) {
                    move_direction = 'a';
                    start_pos = player.x;
                    fin_pos = player.x - 1;
                    animatePlayerMove();
                }
                break;

            case "ArrowRight":
            case "d":
                if(player.x < 22 && map_elements[player.x + 1][player.y].collision == false) {
                    move_direction = 'd';
                    start_pos = player.x;
                    fin_pos = player.x + 1;
                    animatePlayerMove();
                }
                break;

            default:
                return;
        }
    }
});

