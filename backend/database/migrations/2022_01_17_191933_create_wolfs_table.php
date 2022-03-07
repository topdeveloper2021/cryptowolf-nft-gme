<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWolfsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        /*
        # BREED
        LAND: 0
        WATER: 1
        ICE: 2
        FIRE: 3
        FOREST: 4
        AIR: 5
        ELECTRIC: 6
        LEGENDARY: 7
        # GENDER
        MALE: 0
        FEMALE: 1
        }
        # LEVEL
        WOOD: 0
        BRONZE: 1
        SILVER: 2
        GOLD: 3
        PLATINUM: 4
        DIAMOND: 5
        */

        Schema::create('wolfs', function (Blueprint $table) {
            $table->id();

            $table->string("nft_id")->unique();
            $table->string("contract_address");
            $table->string("owner");
            $table->enum("rarity", array(0,1,2,3,4,5));
            $table->enum("breed", array(0,1,2,3,4,5,6,7));
            $table->enum("gender", array(0,1));
            $table->integer("hp");
            $table->integer("atack");
            $table->integer("defense");

            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('wolfs');
    }
}
