inotifywait -q -m -e close_write $1 |
while read -r filename event; do
  node $2        # or "./$filename"
done