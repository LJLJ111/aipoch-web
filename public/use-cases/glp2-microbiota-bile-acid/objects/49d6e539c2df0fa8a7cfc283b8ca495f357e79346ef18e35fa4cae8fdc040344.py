# -*- coding: utf-8 -*-
# sample_script.py
# A simple Python example script

import sys
import platform

def main():
    print("=" * 40)
    print("Python Runtime Check")
    print("=" * 40)
    print(f"Python version: {sys.version}")
    print(f"Platform: {platform.platform()}")
    print(f"Architecture: {platform.architecture()[0]}")
    print("=" * 40)

if __name__ == "__main__":
    main()
