:@echo off
del .latest\down-the-moon.xpi
call python3 make.py --release .latest\down-the-moon.xpi
pause