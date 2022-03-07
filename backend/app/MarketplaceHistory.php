<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Throwable;
use Exception;

class MarketplaceHistory extends Model
{
    use HasFactory;

    protected $table = "marketplace_history";
}
