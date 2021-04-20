(function(){

    function player_info(_x, _y, _location, _level, _experience) {
        this.x = _x,
        this.y = _y,
        this.location = _location,
        this.level = _level,
        this.experience = _experience,
        this.updateExp = function() {
            let lvl_exp = Math.pow(this.level, 4);
            let next_lvl_exp = Math.pow((this.level + 1), 4);
            let exp_bar = document.getElementById('exp-bar-progress');
            let exp_between = next_lvl_exp - lvl_exp;
            let lvl_exp_bar = this.experience - lvl_exp;
            let progress = (lvl_exp_bar * 100) / exp_between;
            let progress_string = progress.toString() + "%";
            exp_bar.style.width = progress_string;
        }
    }

    function enemy_info(_name, _level, _x, _y, _image) {
        this.name = _name,
        this.level = _level,
        this.x = _x,
        this.y = _y,
        this.image = _image,
        this.addEnemy = function() {

            let enemy_place_string = "div.row-" + this.y + ".col-" + this.x;
            let enemy_class_name = "enemy-" + this.name + "-" + this.level;
            let enemy_place = document.querySelector(enemy_place_string);
            enemy_place.classList.add("enemy");
            enemy_place.classList.add(enemy_class_name);
            let enemy_image = '<img src = ' + this.image + '>';
            enemy_place.innerHTML = enemy_image;
        },
        this.returnMapElement = function () {
            let enemy_place_string = "div.row-" + this.y + ".col-" + this.x;
            let enemy_place = document.querySelector(enemy_place_string);
            return enemy_place;
        },
        this.returnTooltipInfo = function () {
            let TooltipInfo = this.name + " (" + this.level + ")";
            return TooltipInfo;
        }
    }

    function door_info(_to_id, _to_name, _x, _y) {
        this.to = _to_id,
        this.to_name = _to_name,
        this.x = _x,
        this.y = _y,
        this.addDoor = function() {
            let door_place_string = "div.row-" + this.y + ".col-" + this.x;
            let door_class_name = "to-" + this.to;
            let door_place = document.querySelector(door_place_string);
            door_place.classList.add("door");
            door_place.classList.add(door_class_name);
            let door_image = '<img src = "../../media/door_right.png">';
            door_place.innerHTML = door_image;
        },
        this.returnMapElement = function () {
            let door_place_string = "div.row-" + this.y + ".col-" + this.x;
            let door_place = document.querySelector(door_place_string);
            return door_place;
        }
    }

    let player = new player_info(1, 1, 1, 1, 1);
    let enemy_table = new Array();
    let door_table = new Array();

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
    const player_id = document.getElementById("player-id").innerHTML;

    $.ajax({
        url: "http://127.0.0.1:8000/engine/rest/players/" + player_id + "/",
        type: 'GET',
        method: 'GET',
        success: function(data) {
            init(data);
            load_all();
        }
    });


    function updatePosition() {

        $.ajax({
          url: "http://127.0.0.1:8000/engine/rest/players/" + player_id + "/",
          type: 'PATCH',
          method: 'PATCH',
          headers: {'X-CSRFToken': csrftoken},
          data: player,
        });
    }


    function init(data) {
        player.x = data.x;
        player.y = data.y;
        player.location = data.location;
        player.level = data.level;
        player.experience = data.experience;
        player.updateExp();

        let move_perm = true;

        move();
    }

    var load_all = function() {
        $.ajax({
          url: "http://127.0.0.1:8000/engine/rest/locations/" + player.location + "/",
          type: 'GET',
          method: 'GET',
          success: function(data) {
            for (let i = 0; i<data.location_spot.length; i++) {

                if (data.location_spot[i].enemy != null) {

                    enemy_table.push(new enemy_info(data.location_spot[i].enemy.name,
                                    data.location_spot[i].enemy.level,
                                    data.location_spot[i].x,
                                    data.location_spot[i].y,
                                    data.location_spot[i].enemy.image));
                }
                else if (data.location_spot[i].door != null) {

                    door_table.push(new door_info(data.location_spot[i].door.location_name.id,
                                    data.location_spot[i].door.location_name.name,
                                    data.location_spot[i].x,
                                    data.location_spot[i].y));
                }
            }
          }
        });

        setTimeout(addEntities, 500);
        setTimeout(addTooltips, 500);
    };

	function move(direction) {

		row = document.querySelectorAll(".row-" + player.y);
		map_el = row[player.x-1];
		map_el.innerHTML = '';

		switch(direction) {

			case "down":
				if (player.y < 18) {
					let y_pos = player.y + 1;
				    let x_pos = player.x;
				    let element = 'div.row-' + y_pos + '.col-' + x_pos;
				    let inner_element = document.querySelector(element).innerHTML;
				    if (inner_element == '') {
				        player.y++;
				    }
				}
				break;

			case "up":
				if ( player.y > 1) {
				    let y_pos = player.y - 1;
				    let x_pos = player.x;
				    let element = 'div.row-' + y_pos + '.col-' + x_pos;
				    let inner_element = document.querySelector(element).innerHTML;
				    if (inner_element == '') {
				        player.y--;
				    }
				}
				break;

			case "left":
				if ( player.x > 1) {
					let y_pos = player.y;
				    let x_pos = player.x - 1;
				    let element = 'div.row-' + y_pos + '.col-' + x_pos;
				    let inner_element = document.querySelector(element).innerHTML;
				    if (inner_element == '') {
				        player.x--;
				    }
				}
				break;

			case "right":
				if ( player.x < 23) {
					let y_pos = player.y;
				    let x_pos = player.x + 1;
				    let element = 'div.row-' + y_pos + '.col-' + x_pos;
				    let inner_element = document.querySelector(element).innerHTML;
				    if (inner_element == '') {
				        player.x++;
				    }
				}
				break;

			default:
				break;
		}

		updatePosition();

		var row;
		var map_el;

		document.getElementById("coords").innerHTML = player.x + "," + player.y;
		row = document.querySelectorAll(".row-" + player.y);
		map_el = row[player.x-1];
		map_el.innerHTML = '<img src = "../../media/character.png">';

		move_perm = true;
	}

	document.addEventListener("keydown", function(event) {

		switch(event.key) {

			case "ArrowDown":
			case "s":
				if (move_perm == true) {
					move_perm = false;
					setTimeout(function() {move("down");}, 300);
				}
				break;

			case "ArrowUp":
			case "w":
				if (move_perm == true) {
					move_perm = false;
					setTimeout(function() {move("up");}, 300);
				}
				break;

			case "ArrowLeft":
			case "a":
				if (move_perm == true) {
					move_perm = false;
					setTimeout(function() {move("left");}, 300);
				}
				break;

			case "ArrowRight":
			case "d":
				if (move_perm == true) {
					move_perm = false;
					setTimeout(function() {move("right");}, 300);
				}
				break;

			default:
				return;
		}

	});

	function addEntities() {

        for (let j = 0; j<door_table.length; j++) {
            door_table[j].addDoor();
        }
        for (let j = 0; j<enemy_table.length; j++) {
            enemy_table[j].addEnemy();
        }
	}

    function addTooltips () {

        let all_enemy = document.querySelectorAll('.enemy');
        let all_door = document.querySelectorAll('.door');
        let tooltip = document.querySelector('.tooltip');
        let game_window = document. querySelector('.main-wrapper');

        for (let j = 0; j<enemy_table.length; j++) {

            let map_enemy_el = enemy_table[j].returnMapElement();
            let new_tooltip = tooltip.cloneNode(true);
            game_window.appendChild(new_tooltip);

            map_enemy_el.addEventListener('mouseenter', function(event) {

                let temp;
                temp = enemy_table[j].x * 32 - 55;
                let x_px_str = temp.toString() + "px";
                new_tooltip.innerHTML = enemy_table[j].returnTooltipInfo();
                new_tooltip.style.left = x_px_str;
                temp = enemy_table[j].y * 32 - 55;
                let y_px_str = temp.toString() + "px";
                new_tooltip.style.top = y_px_str;
                new_tooltip.style.display = 'block';
            });
            map_enemy_el.addEventListener('mouseleave', function(event) {

                new_tooltip.innerHTML = '';
                new_tooltip.style.display = 'none';
            });
        }

        for (let j = 0; j<door_table.length; j++) {

            let map_door_el = door_table[j].returnMapElement();
            let new_tooltip = tooltip.cloneNode(true);
            game_window.appendChild(new_tooltip);

            map_door_el.addEventListener('mouseenter', function(event) {

                let temp;
                temp = door_table[j].x * 32 - 55;
                let x_px_str = temp.toString() + "px";
                new_tooltip.innerHTML = door_table[j].to_name;
                new_tooltip.style.left = x_px_str;
                temp = door_table[j].y * 32 - 55;
                let y_px_str = temp.toString() + "px";
                new_tooltip.style.top = y_px_str;
                new_tooltip.style.display = 'block';
                new_tooltip.style.color = 'blue';
            });
            map_door_el.addEventListener('mouseleave', function(event) {

                new_tooltip.innerHTML = '';
                new_tooltip.style.display = 'none';
            });
        }
    }

})();