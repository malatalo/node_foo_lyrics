ReDim arr(WScript.Arguments.Count-1)
For i = 0 To WScript.Arguments.Count-1
  arr(i) = WScript.Arguments(i)
Next

query = Join(arr)
url = "https://www.google.com/search?q=" & query & " lyrics"

set objShell = CreateObject("Shell.Application")
objShell.ShellExecute "chrome.exe", """" & url & """"