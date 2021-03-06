Describe 'time.sh'
  Include lib/functions/time.sh
  Parameters
    "#1" "@100" "@0" "1m40s"
    "#2" "@60" "@0" "1m0s"
    "#3" "@3601" "@0" "1h0m1s"
    "#4" "@$((3600 * 24))" "@0" "1d0h0m0s"
    "#5" "@$((3600 * 24 * 7))" "@0" "1w0d0h0m0s"
    "#5" "@$((3600 * 24 * 8 + 3659))" "@0" "1w1d1h0m59s"
  End
  It "compute DELTATIME $1"
    When call deltatime "$2" "$3"
    The status should be success
    The variable DELTATIME should equal "$4"
  End
End