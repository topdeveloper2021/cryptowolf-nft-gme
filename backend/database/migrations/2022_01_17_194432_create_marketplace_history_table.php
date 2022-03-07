<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMarketplaceHistoryTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('marketplace_history', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('marketplace_wolf_id')->nullable();
            $table->unsignedBigInteger('marketplace_material_id')->nullable();

            $table->string('from');
            $table->string('to');

            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

            $table->foreign('marketplace_wolf_id')->references('id')->on('marketplace_wolfs');
            $table->foreign('marketplace_material_id')->references('id')->on('marketplace_materials');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('marketplace_history');
    }
}
