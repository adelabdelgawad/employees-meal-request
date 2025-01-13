// 1. Fetch roles (returns the roles examples)
export async function fetchRoles() {
  try {
    const response = await fetch(`http://localhost:8000/roles`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
}

// 2. Fetch domain users (returns the users examples)
export async function fetchDomainUsers() {
  try {
    const response = await fetch(`http://localhost:8000/domain-users`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
}
export async function fetchUsers(
  userId?: number,
): Promise<User | User[] | null> {
  const users: User[] = [
    {
      id: 1,
      fullName: 'Jessica Davis',
      username: 'jessicadavis',
      title: 'Software Engineer',
      roles: [
        { id: 1, name: 'Administrator' },
        { id: 2, name: 'Editor' },
      ],
    },
    {
      id: 2,
      fullName: 'Mike Moore',
      username: 'mikemoore',
      title: 'Project Manager',
      roles: [{ id: 1, name: 'Administrator' }],
    },
  ];

  // Return a single user if userId is provided
  if (userId) {
    return users.find((user) => user.id === userId) || null;
  }

  // Return all users if no userId is provided
  return users;
}

// 3. Submit Add User (logs the created user details)
export async function submitAddUser(userId: number, roles: number[]) {
  // Simulate user creation process
  console.log('User created:', { userId, roles });

  // Return a confirmation response
  return {
    success: true,
    message: 'User added successfully',
    data: { userId, roles },
  };
}
