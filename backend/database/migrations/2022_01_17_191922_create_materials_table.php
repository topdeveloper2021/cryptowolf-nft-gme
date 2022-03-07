<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMaterialsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        /*
        # LEVEL
        WOOD: 0
        BRONZE: 1
        SILVER: 2
        GOLD: 3
        PLATINUM: 4
        DIAMOND: 5
        */

        Schema::create('materials', function (Blueprint $table) {
            $table->id();

            $table->string("nft_id")->unique();
            $table->string("contract_address");
            $table->string("owner");
            $table->enum("rarity", array(0,1,2,3,4,5));

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
        Schema::dropIfExists('materials');
    }
}
