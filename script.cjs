const cp = require('child_process');
const fs = require('fs');
const txt = cp.execSync('git show main:src/components/Layout.tsx', {encoding: 'utf8'});
fs.writeFileSync('src/components/Layout.tsx', "import '../admin.css';\n" + txt);
