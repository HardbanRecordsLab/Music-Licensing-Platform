<?php
/**
 * HRL Headless integration for WordPress + Paid Memberships Pro.
 * Paste this into your theme's functions.php or include it from wp-config.php.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! defined( 'HRL_API_ENDPOINT' ) ) {
    define( 'HRL_API_ENDPOINT', 'https://api.hrl-music.com' );
}

if ( ! defined( 'HRL_HEADLESS_SECRET' ) ) {
    define( 'HRL_HEADLESS_SECRET', 'replace-with-long-random-secret' );
}

function hrl_headless_request_args( $args, $url ) {
    if ( strpos( $url, HRL_API_ENDPOINT . '/api/users' ) !== false ) {
        if ( ! isset( $args['headers'] ) || ! is_array( $args['headers'] ) ) {
            $args['headers'] = array();
        }
        $args['headers']['Content-Type'] = 'application/json';
        $args['headers']['X-HRL-HEADLESS-SECRET'] = HRL_HEADLESS_SECRET;
    }
    return $args;
}
add_filter( 'http_request_args', 'hrl_headless_request_args', 10, 2 );

function hrl_sync_pmpro_user_to_hrl( $user_id, $membership_level_id, $cancel_level = null ) {
    $user = get_userdata( $user_id );
    if ( ! $user ) {
        return;
    }

    $name = trim( $user->first_name . ' ' . $user->last_name );
    if ( empty( $name ) ) {
        $name = $user->display_name;
    }

    $body = wp_json_encode( array(
        'email' => $user->user_email,
        'name' => $name,
        'role' => 'subscriber',
        'pmproLevel' => absint( $membership_level_id ),
        'password' => wp_generate_password( 16, false ),
    ) );

    wp_remote_post( HRL_API_ENDPOINT . '/api/users', array(
        'method'      => 'POST',
        'headers'     => array(
            'Content-Type' => 'application/json',
        ),
        'body'        => $body,
        'timeout'     => 20,
        'redirection' => 5,
        'blocking'    => false,
    ) );
}
add_action( 'pmpro_after_checkout', 'hrl_sync_pmpro_user_to_hrl', 10, 2 );
add_action( 'pmpro_after_change_membership_level', 'hrl_sync_pmpro_user_to_hrl', 10, 3 );
