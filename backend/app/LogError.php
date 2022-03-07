<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogError extends Model
{
    use HasFactory;

    protected $table = "logs_errors";

    public static function saveError($function, $data, $error)
    {
        $theLogError = new LogError();
        $theLogError->function = $function;
        $theLogError->data = json_encode($data);
        $theLogError->error = $error;
        $theLogError->save();
    }
}
