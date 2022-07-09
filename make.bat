:@echo off
del .latest\down-the-mall.xpi
call python3 make.py --release .latest\down-the-mall.xpi
pause