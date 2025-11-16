:@echo off
del .latest\down-the-moon.xpi
call python make.py --release .latest\down-the-moon.xpi
:pause