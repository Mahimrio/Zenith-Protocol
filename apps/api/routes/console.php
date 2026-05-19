<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('challenges:generate')->dailyAt('23:00')->timezone('UTC');
