<?php

$my_img = imagecreatefrompng("blank.png");
$text_colour = imagecolorallocate( $my_img, 0, 0, 0 );
imagestring( $my_img, 4, 30, 25, "1922 UTC",$text_colour );

header( "Content-type: image/png" );
imagepng( $my_img );

?>
