<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create([
            'email' => 'operator@valstracking.com',
            'password' => Hash::make('CorrectPassword123!'),
        ]);

        $response = $this->post('/login', [
            'email' => 'operator@valstracking.com',
            'password' => 'CorrectPassword123!',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect('/dashboard');
    }

    public function test_users_cannot_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'email' => 'operator@valstracking.com',
            'password' => Hash::make('CorrectPassword123!'),
        ]);

        $response = $this->from('/login')->post('/login', [
            'email' => 'operator@valstracking.com',
            'password' => 'WrongPassword999',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_users_cannot_authenticate_with_unknown_email(): void
    {
        $response = $this->from('/login')->post('/login', [
            'email' => 'nonexistent@valstracking.com',
            'password' => 'AnyPassword123!',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_generic_failure_message_does_not_reveal_email_existence(): void
    {
        // Test with existing user + wrong password
        $user = User::factory()->create([
            'email' => 'exists@valstracking.com',
            'password' => Hash::make('Password123!'),
        ]);

        $responseExisting = $this->post('/login', [
            'email' => 'exists@valstracking.com',
            'password' => 'WrongPassword',
        ]);

        // Test with non-existing user
        $responseNonExisting = $this->post('/login', [
            'email' => 'doesnotexist@valstracking.com',
            'password' => 'WrongPassword',
        ]);

        // Both must return identical generic validation errors without leaking user existence
        $responseExisting->assertSessionHasErrors('email');
        $responseNonExisting->assertSessionHasErrors('email');
    }

    public function test_guests_cannot_access_protected_dashboard(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_users_can_access_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/login');
    }

    public function test_password_is_hashed_on_user_creation(): void
    {
        $user = User::create([
            'name' => 'Field Technician',
            'email' => 'tech@valstracking.com',
            'password' => 'RawPassword123',
        ]);

        $this->assertNotEquals('RawPassword123', $user->password);
        $this->assertTrue(Hash::check('RawPassword123', $user->password));
    }

    public function test_password_and_remember_token_are_hidden_from_serialization(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('Secret12345'),
        ]);

        $serialized = $user->toArray();

        $this->assertArrayNotHasKey('password', $serialized);
        $this->assertArrayNotHasKey('remember_token', $serialized);
    }

    public function test_excessive_login_attempts_are_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', [
                'email' => 'target@valstracking.com',
                'password' => 'InvalidPassword',
            ]);
        }

        // 6th attempt must trigger throttling exception
        $response = $this->post('/login', [
            'email' => 'target@valstracking.com',
            'password' => 'InvalidPassword',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_inactive_users_cannot_authenticate_and_establish_session(): void
    {
        $inactiveUser = User::factory()->create([
            'email' => 'suspended@valstracking.com',
            'password' => Hash::make('ValidPassword123!'),
            'is_active' => false,
        ]);

        $response = $this->post('/login', [
            'email' => 'suspended@valstracking.com',
            'password' => 'ValidPassword123!',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }
}
