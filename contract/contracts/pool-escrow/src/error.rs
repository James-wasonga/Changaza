use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[#[repr(32)]]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    PoolNotFound = 3,
    PoolAlreadyExists = 4,
    PoolClosed = 5,
    AlreadyJoined = 6,
    InvalidAmount = 7,
}


