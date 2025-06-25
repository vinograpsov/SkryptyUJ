#!/usr/bin/env bash



declare -a board=(" " " " " " " " " " " " " " " " " ")  

current_player="X"



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





game_loop(){

    clear

    echo "tic tac toe"

    print_board

    

    while true; do

        read -p "Player $current_player, choose field (1-9): " move

    

        if ! is_valid_move "$move"; then

            echo "Invalid field! Choose other."

            continue

        fi

    

        board[$((move-1))]="$current_player"

        print_board

    

        if check_win "$current_player"; then

            echo "Player $current_player has won! Congratulations!"

            break

        fi

    

        if is_board_full; then

            echo "Tie"

            break

        fi

    

        switch_player

done    

}



game_loop


