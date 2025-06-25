#!/usr/bin/env bash







declare -a board=(" " " " " " " " " " " " " " " " " ")  

current_player="X"

save_file=""

mode=""



print_board() {



  echo ""



  echo " ${board[0]} | ${board[1]} | ${board[2]} "



  echo "---+---+---"



  echo " ${board[3]} | ${board[4]} | ${board[5]} "



  echo "---+---+---"



  echo " ${board[6]} | ${board[7]} | ${board[8]} "



  echo ""



}







check_win() {



  local wins=(



    "0 1 2" "3 4 5" "6 7 8"



    "0 3 6" "1 4 7" "2 5 8"



    "0 4 8" "2 4 6"



  )



  for win in "${wins[@]}"; do



    read -r a b c <<<"$win"



    if [[ ${board[$a]} != " " && ${board[$a]} == "${board[$b]}" && ${board[$b]} == "${board[$c]}" ]]; then



      return 0



    fi



  done



  return 1



}







is_valid_move() {



    local pos=$1



    [[ $pos =~ ^[1-9]$ ]] && [[ "${board[$((pos-1))]}" == " " ]]



}







is_board_full() {



    for i in {0..8}; do



        [[ "${board[$i]}" == " " ]] && return 1



    done



    return 0



}















switch_player() {



    [[ $current_player == "X" ]] && current_player="O" || current_player="X"



}





save_game(){

  read -p "enter file name for save: " fname

  save_file="$fname"

  {

    echo "$current_player"

    printf "%s\n" "${board[@]}"

  } > "$save_file"

  echo "Game was saved in '$save_file'."

}







load_game(){

  read -p "enter filename for load: " fname

    if [[ ! -f $fname ]]; then

    echo "File '$fname' have not found."

    return 1

  fi

  save_file="$fname"

  read -r current_player < "$save_file"

  mapfile -t board < <(tail -n +2 "$save_file")

  echo "Game was loaded from '$save_file'. Players turn: $current_player."

  return 0

}





init_board(){

  board=(" " " " " " " " " " " " " " " " " ")  

  current_player="X"

}



main_menu() {

  echo "=== tic tac toe ==="

  echo "1) new game (2 players)"

  echo "2) new game (vs computer)"

  echo "3) load game"

  echo "4) exit"

  read -p "choose option [1-4]: " opt

  case $opt in

    1) mode="pvp"; init_board; return 0 ;;

    2) mode="pvc"; init_board; return 0 ;;

    3) 

      if load_game; then

        mode="pvp"

        return 0

      else

        main_menu

      fi

      ;;

    4) exit 0 ;;

    *) echo "Wrong choosen option."; main_menu ;;

  esac

}







game_loop(){



    clear



    echo "tic tac toe"



    print_board



    



    while true; do



        if [[ $mode == "pvc" && $current_player == "O" ]]; then

          ai_move

        else



        clear 

        print_board

        echo "(For save enter 'S')"



        read -p "Player $current_player, choose field (1-9): " move



        if [[ $move == [Ss] ]]; then

          save_game

          continue

        fi



        if ! is_valid_move "$move"; then



            echo "Invalid field! Choose other."



            continue



        fi



    



        board[$((move-1))]="$current_player"

        fi

        print_board



    



        if check_win "$current_player"; then



          clear; print_board

          if [[ $mode == "pvc" && $current_player == "O" ]]; then

            echo "Computer (O) wins!"

          else

            echo "Player $current_player wins!"

          fi

          break



        fi



    



        if is_board_full; then



            echo "Tie"



            break



        fi



    



        switch_player



done    



}



ai_move(){

  for i in {0..8}; do

    if [[ "${board[$i]}" == " " ]]; then

      board[$i]="O"

      if check_win; then

        return

      else

        board[$i]=" "

      fi

    fi

  done

  for i in {0..8}; do

    if [[ "${board[$i]}" == " " ]]; then

      board[$i]="X"

      if check_win; then

        board[$i]="O"

        return

      else

        board[$i]=" "

      fi

    fi

  done

  local empties=()

  for i in {0..8}; do

    [[ "${board[$i]}" == " " ]] && empties+=($i)

  done

  local pick=${empties[RANDOM % ${#empties[@]}]}

  board[$pick]="O"

}









main_menu

game_loop





