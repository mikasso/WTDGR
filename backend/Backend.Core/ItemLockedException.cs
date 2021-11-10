using System;
using System.Runtime.Serialization;

namespace Backend.Core
{
    public class ItemLockedException : Exception
    {
        public ItemLockedException(string msg) : base("Cannot execute user action because the item is currently locked. " + msg) { }
    }

    public class UserHasNoPermissionException : Exception
    {
        public UserHasNoPermissionException(string msg) : base(msg) { }
    }
    public class ItemDoesNotExistException : Exception
    {
        public ItemDoesNotExistException(string msg) : base(msg) { }
    }
}